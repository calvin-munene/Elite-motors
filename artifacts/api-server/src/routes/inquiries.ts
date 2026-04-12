import { Router } from "express";
import { db } from "@workspace/db";
import { inquiriesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

function formatInquiry(i: typeof inquiriesTable.$inferSelect) {
  return { ...i, createdAt: i.createdAt.toISOString() };
}

router.get("/inquiries", async (req, res) => {
  try {
    const { status, limit = "20", offset = "0" } = req.query as Record<string, string>;
    const conditions = status ? [eq(inquiriesTable.status, status)] : [];
    const [inquiries, countResult] = await Promise.all([
      db.select().from(inquiriesTable)
        .where(conditions.length ? conditions[0] : undefined)
        .orderBy(desc(inquiriesTable.createdAt))
        .limit(parseInt(limit))
        .offset(parseInt(offset)),
      db.select({ count: sql<number>`count(*)` }).from(inquiriesTable)
        .where(conditions.length ? conditions[0] : undefined),
    ]);
    res.json({ inquiries: inquiries.map(formatInquiry), total: Number(countResult[0]?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Error listing inquiries");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/inquiries", async (req, res) => {
  try {
    const result = await db.insert(inquiriesTable).values(req.body).returning();
    res.status(201).json(formatInquiry(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating inquiry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/inquiries/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.select().from(inquiriesTable).where(eq(inquiriesTable.id, id));
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatInquiry(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error getting inquiry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/inquiries/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(inquiriesTable).set(req.body).where(eq(inquiriesTable.id, id)).returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatInquiry(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating inquiry");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
