import { Router } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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
- NTSA (National Transport Safety Authority) requirements for registration and logbook transfer
- Common issues with Kenyan roads: high ground clearance recommendations, suspension considerations for rough roads
- Popular dealership areas in Nairobi: Industrial Area, Ngong Road, Mombasa Road
- Currency: Kenya Shilling (KES). Current USD to KES rate approximately 130.
- Popular financing: KCB, Equity Bank, ABSA, Stanbic, Mwalimu SACCO hire purchase rates typically 14-18% per annum

**Technical Expertise:**
- How to inspect a used car: checking frame, rust, paint, engine mounts, service history, mileage tampering
- Japanese auction grades explained: Grade S (new/near new), Grade 4.5-5 (excellent), Grade 4 (very good), Grade 3.5-3 (good/normal), Grade 2 (below average), Grade 1 (poor)
- Common problems by make/model: Toyota reliability, Subaru head gasket issues, BMW electronics costs, etc.
- Service costs and spare parts availability in Kenya
- Fuel consumption benchmarks for different vehicle categories
- Safety ratings: Euro NCAP, ANCAP, JNCAP ratings
- Technology features: adaptive cruise control, lane assist, blind spot monitoring, 360-degree cameras

**Buying Guidance:**
- How to negotiate car prices in Kenya
- What questions to ask a dealer
- Documentation needed: logbook, insurance, inspection certificate
- Comprehensive vs third-party insurance considerations
- Best value-for-money choices at different budgets (KES 500K, 1M, 2M, 3M, 5M+)
- Red flags when buying a used car
- Hire purchase vs outright purchase vs bank loan considerations

**Dealership Information:**
- AutoElite Motors is a premium dealership in Kenya
- We stock: Mercedes-Benz, BMW, Porsche, Range Rover, Toyota, Audi, Subaru, and other premium brands
- We offer: test drives, financing arrangements, trade-ins, KRA import assistance, NTSA transfer services
- Contact: WhatsApp +254 700 000 000 for immediate inquiries

**Response Style:**
- Be conversational, helpful, and knowledgeable
- Give specific, actionable advice tailored to Kenya context
- Use KES for pricing when relevant
- Mention AutoElite Motors inventory when relevant
- If asked about a specific car's price at AutoElite, invite them to browse inventory or contact us
- Keep responses concise but comprehensive
- Use bullet points for clarity when comparing options`;

router.get("/openai/conversations", async (req, res) => {
  try {
    const conversations = await db
      .select()
      .from(conversationsTable)
      .orderBy(desc(conversationsTable.createdAt));
    res.json(conversations.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error listing conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/openai/conversations", async (req, res) => {
  try {
    const { title } = req.body;
    const [conversation] = await db
      .insert(conversationsTable)
      .values({ title: title || "New Conversation" })
      .returning();
    res.status(201).json({ ...conversation, createdAt: conversation.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/openai/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, id));
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(messagesTable.createdAt);

    res.json({
      ...conversation,
      createdAt: conversation.createdAt.toISOString(),
      messages: msgs.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/openai/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Content is required" });

    // Save user message
    await db.insert(messagesTable).values({
      conversationId: id,
      role: "user",
      content,
    });

    // Get conversation history
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
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save assistant response
    await db.insert(messagesTable).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
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

export default router;
