import { Router } from "express";
import { db } from "@workspace/db";
import { testimonialsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function formatTestimonial(t: typeof testimonialsTable.$inferSelect) {
  return { ...t, createdAt: t.createdAt.toISOString() };
}

router.get("/testimonials", async (req, res) => {
  try {
    const { published, limit = "20" } = req.query as Record<string, string>;
    const whereClause = published === "true" ? eq(testimonialsTable.isPublished, true) :
      published === "false" ? eq(testimonialsTable.isPublished, false) : undefined;
    const testimonials = await db.select().from(testimonialsTable).where(whereClause)
      .orderBy(desc(testimonialsTable.createdAt)).limit(parseInt(limit));
    res.json(testimonials.map(formatTestimonial));
  } catch (err) {
    req.log.error({ err }, "Error listing testimonials");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/testimonials", async (req, res) => {
  try {
    const result = await db.insert(testimonialsTable).values(req.body).returning();
    res.status(201).json(formatTestimonial(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/testimonials/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(testimonialsTable).set(req.body).where(eq(testimonialsTable.id, id)).returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatTestimonial(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/testimonials/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
