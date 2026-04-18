import { Router } from "express";
import { db } from "@workspace/db";
import { carsTable } from "@workspace/db";
import { eq, sql, and, or, ilike } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

// POST /api/visual-search - body { imageBase64: data:image/...;base64,..., imageUrl?: string }
router.post("/visual-search", async (req, res) => {
  try {
    const { imageBase64, imageUrl } = req.body;
    if (!imageBase64 && !imageUrl) return res.status(400).json({ error: "imageBase64 or imageUrl required" });

    const imageInput = imageBase64 || imageUrl;

    const visionResp = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You are an automotive image-recognition expert. Analyze the car in the image and respond ONLY with strict JSON of this shape:
{"make":"Toyota","model":"Land Cruiser Prado","year_estimate":2020,"body_type":"suv","color":"white","confidence":0.85,"description":"<one short sentence>"}
- body_type must be one of: sedan, suv, crossover, hatchback, pickup, coupe, convertible, wagon, van, mpv
- color must be a single common color word (white, black, silver, grey, blue, red, etc.)
- confidence is 0..1
- If you cannot identify a car, set make and model to "Unknown" and confidence to 0
- Return ONLY the JSON. No markdown, no commentary.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this vehicle." },
            { type: "image_url", image_url: { url: imageInput } } as any,
          ] as any,
        },
      ],
    });

    const raw = visionResp.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); } catch { parsed = { make: "Unknown", model: "Unknown", confidence: 0 }; }

    // Build search conditions: match make OR (body_type AND color)
    const matches: any[] = [];

    if (parsed.make && parsed.make !== "Unknown") {
      const exactMakeModel = await db.select().from(carsTable).where(
        and(
          eq(carsTable.isPublished, true),
          ilike(carsTable.make, `%${parsed.make}%`),
          parsed.model && parsed.model !== "Unknown" ? ilike(carsTable.model, `%${parsed.model.split(" ")[0]}%`) : sql`true`
        )
      ).limit(8);
      matches.push(...exactMakeModel);
    }

    if (matches.length < 6 && parsed.body_type) {
      const byBody = await db.select().from(carsTable).where(
        and(
          eq(carsTable.isPublished, true),
          eq(carsTable.bodyType, parsed.body_type),
          parsed.color ? ilike(carsTable.color, `%${parsed.color}%`) : sql`true`
        )
      ).limit(8);
      for (const c of byBody) {
        if (!matches.find(m => m.id === c.id)) matches.push(c);
      }
    }

    if (matches.length < 4 && parsed.body_type) {
      const fallback = await db.select().from(carsTable).where(
        and(eq(carsTable.isPublished, true), eq(carsTable.bodyType, parsed.body_type))
      ).limit(8);
      for (const c of fallback) {
        if (!matches.find(m => m.id === c.id)) matches.push(c);
      }
    }

    res.json({
      identification: parsed,
      cars: matches.slice(0, 12).map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        price: Number(c.price),
        discountedPrice: c.discountedPrice ? Number(c.discountedPrice) : null,
      })),
    });
  } catch (err: any) {
    req.log?.error({ err }, "Visual search failed");
    res.status(500).json({ error: "Visual search failed", detail: err.message });
  }
});

export default router;
