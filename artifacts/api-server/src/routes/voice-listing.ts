import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// POST /api/admin/voice-listing/parse - body { transcript: "..." }
router.post("/admin/voice-listing/parse", requireAdmin, async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== "string") return res.status(400).json({ error: "transcript required" });

    const resp = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You convert a Kenyan car-dealer's voice transcript into a structured car listing.
Output ONLY strict JSON in this shape (no markdown, no commentary):
{
  "year": 2022,
  "make": "Toyota",
  "model": "Land Cruiser",
  "trim": "Prado TX",
  "title": "<year make model trim>",
  "price": 8500000,
  "mileage": 45000,
  "color": "Black",
  "transmission": "automatic",
  "fuelType": "petrol",
  "bodyType": "suv",
  "drivetrain": "4wd",
  "engineSize": "2.7L",
  "seats": 7,
  "doors": 5,
  "shortDescription": "<one-line summary>",
  "description": "<2-3 sentence detailed description>",
  "features": ["Sunroof", "Leather seats"],
  "condition": "used"
}
Rules:
- Prices are in KES. If the dealer says "8.5 million", output 8500000. If "asking 12 million", output 12000000.
- transmission: one of "automatic", "manual", "cvt"
- fuelType: "petrol", "diesel", "hybrid", "electric"
- bodyType: "sedan", "suv", "crossover", "hatchback", "pickup", "coupe", "convertible", "wagon", "van", "mpv"
- drivetrain: "fwd", "rwd", "awd", "4wd"
- condition: "new" or "used"
- If a field is not mentioned, use a reasonable default (transmission: "automatic", fuelType: "petrol", condition: "used") or null for unknowns.
- features array: extract every mentioned amenity (sunroof, leather, panoramic roof, alloy wheels, etc.)`,
        },
        { role: "user", content: transcript },
      ],
    });

    const raw = resp.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); } catch { return res.status(400).json({ error: "Could not parse car details", raw }); }

    res.json({ parsed });
  } catch (err: any) {
    req.log?.error({ err }, "Voice listing parse failed");
    res.status(500).json({ error: "Parsing failed", detail: err.message });
  }
});

export default router;
