import { Router } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable, chatbotKnowledgeTable, siteSettingsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const CAR_EXPERT_SYSTEM_PROMPT = `You are AutoElite AI, the expert automotive advisor for AutoElite Motors dealership in Nairobi, Kenya. You are a world-class car expert with deep knowledge across all aspects of automobiles.

Your expertise covers:

**Vehicle Knowledge:**
- All makes and models: Toyota, Subaru, Mercedes-Benz, BMW, Audi, Porsche, Range Rover, Volvo, Lexus, Honda, Nissan, Mitsubishi, Mazda, Ford, Chevrolet, Volkswagen, Hyundai, Kia, and all others
- Engine specifications: displacement, horsepower, torque, fuel economy, reliability ratings
- Transmission types: manual, automatic, CVT, DCT, AMT differences and pros/cons
- Drivetrain: FWD, RWD, AWD, 4WD — when each is optimal
- Body types: sedan, SUV, crossover, hatchback, pickup, coupe, convertible, wagon
- Fuel types: petrol, diesel, hybrid, plug-in hybrid (PHEV), electric (EV), LPG

**Kenya & East Africa Specific Knowledge:**
- Most popular cars in Kenya: Toyota Harrier, Land Cruiser Prado, Toyota IST, Subaru Forester, Subaru Impreza, Mazda Demio, Honda Fit, Toyota Fielder, Mitsubishi Outlander
- Import duty calculations: KRA uses CRSP (Current Retail Selling Price) as the reference price
  - Import Duty: 25% of CIF value
  - Excise Duty: 20% for engine up to 1500cc, 25% for 1500-2500cc, 35% for over 2500cc (and electric vehicles 25%)
  - VAT: 16% on (CIF + Import Duty + Excise Duty)
  - IDF: 3.5% of CIF
  - Railway Development Levy (RDL): 2% of CIF
  - Total effective tax rate often 60-80% of CIF value
- Japanese used car imports (JDM): auction grades (S, 4.5, 4, 3.5, 3, 2, 1), chassis numbers, Japan Car Direct, STC Japan, BE FORWARD, CarFromJapan platforms
- Kenyan road conditions: potholes, high ground clearance needs, 4WD preference for rural areas
- Common repairs and spare parts availability in Kenya

**AutoElite Motors Info:**
- Location: Ngong Road, Nairobi (next to Prestige Plaza)
- Phone: +254 700 234 567
- WhatsApp: +254 700 234 567
- Email: sales@autoelitemotors.co.ke
- Opening Hours: Mon-Sat: 8AM-6PM | Sun: 10AM-4PM
- Specialties: Japanese imports, luxury vehicles, financing options

**Communication Style:**
- Friendly, professional, knowledgeable
- Use both English and sprinkle in Swahili greetings (Habari, Asante, Karibu)
- Always provide actionable advice
- When relevant, suggest visiting the showroom or contacting via WhatsApp
- Format responses with markdown: use **bold** for key points, bullet points for lists
- Keep responses concise but comprehensive — avoid walls of text`;

// Stop words to ignore when extracting keywords
const STOP_WORDS = new Set([
  "a","an","the","is","it","in","on","at","to","for","of","and","or","but",
  "i","me","my","we","you","your","he","she","they","what","which","who",
  "how","when","where","why","can","could","would","should","will","do",
  "does","did","has","have","had","be","been","being","was","were","are",
  "am","this","that","these","those","with","from","about","just","some",
  "any","if","so","than","then","there","also","its","our","their","tell",
  "me","us","please","want","need","know","get","give","take","make","go",
  "good","best","like","much","many","more","most","very","really","bit",
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function computeSimilarity(queryKws: string[], storedKws: string[]): number {
  if (!queryKws.length || !storedKws.length) return 0;
  const storedSet = new Set(storedKws);
  const matches = queryKws.filter(kw => storedSet.has(kw)).length;
  return matches / queryKws.length;
}

async function findKnowledgeMatch(question: string): Promise<{ id: number; answer: string; score: number } | null> {
  const queryKws = extractKeywords(question);
  if (!queryKws.length) return null;

  const entries = await db.select().from(chatbotKnowledgeTable).orderBy(desc(chatbotKnowledgeTable.hitCount));
  let best: { id: number; answer: string; score: number } | null = null;

  for (const entry of entries) {
    const storedKws: string[] = JSON.parse(entry.keywords || "[]");
    const score = computeSimilarity(queryKws, storedKws);
    if (score >= 0.45 && (!best || score > best.score)) {
      best = { id: entry.id, answer: entry.answer, score };
    }
  }
  return best;
}

async function saveToKnowledge(question: string, answer: string, source: string) {
  const keywords = extractKeywords(question);
  try {
    await db.insert(chatbotKnowledgeTable).values({
      question: question.slice(0, 500),
      answer: answer.slice(0, 5000),
      keywords: JSON.stringify(keywords),
      source,
      hitCount: 0,
    });
  } catch {
    // Ignore duplicate save errors
  }
}

async function incrementHitCount(id: number) {
  await db.update(chatbotKnowledgeTable)
    .set({ hitCount: sql`${chatbotKnowledgeTable.hitCount} + 1`, updatedAt: new Date() })
    .where(eq(chatbotKnowledgeTable.id, id));
}

async function getChatbotEnabled(): Promise<boolean> {
  const settings = await db.select({ chatbotEnabled: siteSettingsTable.chatbotEnabled }).from(siteSettingsTable).limit(1);
  return settings[0]?.chatbotEnabled !== "false";
}

// ─── Conversation routes ───────────────────────────────────────────────────────

router.post("/openai/conversations", async (req, res) => {
  try {
    const { title } = req.body;
    const [conv] = await db.insert(conversationsTable).values({ title: title || "Chat" }).returning();
    res.json(conv);
  } catch (err) {
    req.log.error({ err }, "Error creating conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/openai/conversations", async (req, res) => {
  try {
    const convs = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.createdAt));
    res.json(convs);
  } catch (err) {
    req.log.error({ err }, "Error fetching conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(messagesTable.createdAt);
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Error fetching messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Main message handler ──────────────────────────────────────────────────────

router.post("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });

    const chatbotEnabled = await getChatbotEnabled();

    // Save user message
    await db.insert(messagesTable).values({ conversationId: id, role: "user", content });

    // 1. Try local knowledge base first
    const localMatch = await findKnowledgeMatch(content);

    if (localMatch && localMatch.score >= 0.45) {
      // Serve from local knowledge
      await incrementHitCount(localMatch.id);

      const answer = localMatch.answer;

      // Save assistant reply to messages
      await db.insert(messagesTable).values({ conversationId: id, role: "assistant", content: answer });

      // Stream it back word-by-word for a natural feel
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const words = answer.split(" ");
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ content: word + " ", source: "local" })}\n\n`);
        await new Promise(r => setTimeout(r, 18));
      }
      res.write(`data: ${JSON.stringify({ done: true, source: "local" })}\n\n`);
      res.end();
      return;
    }

    // 2. If chatbot is DISABLED and no local knowledge — return support message
    if (!chatbotEnabled) {
      const supportMsg = "I'm sorry, the AI assistant is currently unavailable. Please reach out to us directly:\n\n" +
        "**WhatsApp:** [+254 700 234 567](https://wa.me/254700234567)\n" +
        "**Email:** sales@autoelitemotors.co.ke\n" +
        "**Phone:** +254 700 234 567\n\n" +
        "Our team is available Mon-Sat: 8AM-6PM | Sun: 10AM-4PM and will be happy to assist you!";

      await db.insert(messagesTable).values({ conversationId: id, role: "assistant", content: supportMsg });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write(`data: ${JSON.stringify({ content: supportMsg, source: "support" })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, source: "support" })}\n\n`);
      res.end();
      return;
    }

    // 3. Chatbot enabled + no local match — call OpenAI
    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(messagesTable.createdAt);

    const chatMessages = [
      { role: "system" as const, content: CAR_EXPERT_SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content;
      if (chunkContent) {
        fullResponse += chunkContent;
        res.write(`data: ${JSON.stringify({ content: chunkContent, source: "openai" })}\n\n`);
      }
    }

    // Save to DB
    await db.insert(messagesTable).values({ conversationId: id, role: "assistant", content: fullResponse });

    // Learn from this interaction — save to knowledge base for future use
    if (fullResponse.length > 20) {
      await saveToKnowledge(content, fullResponse, "openai");
    }

    res.write(`data: ${JSON.stringify({ done: true, source: "openai" })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

// ─── Admin: Knowledge base management ─────────────────────────────────────────

router.get("/openai/knowledge", async (req, res) => {
  try {
    const entries = await db.select().from(chatbotKnowledgeTable).orderBy(desc(chatbotKnowledgeTable.hitCount));
    res.json(entries);
  } catch (err) {
    req.log.error({ err }, "Error fetching knowledge");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/openai/knowledge/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(chatbotKnowledgeTable).where(eq(chatbotKnowledgeTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting knowledge entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/openai/knowledge", async (req, res) => {
  try {
    await db.delete(chatbotKnowledgeTable);
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error clearing knowledge base");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
