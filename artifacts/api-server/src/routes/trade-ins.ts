import { Router } from "express";
import { db } from "@workspace/db";
import { tradeInsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router = Router();

function formatTradeIn(t: typeof tradeInsTable.$inferSelect) {
  return {
    ...t,
    askingPrice: t.askingPrice ? Number(t.askingPrice) : null,
    photos: (t.photos as string[]) || [],
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/trade-ins", async (req, res) => {
  try {
    const { limit = "20", offset = "0" } = req.query as Record<string, string>;
    const [tradeIns, countResult] = await Promise.all([
      db.select().from(tradeInsTable).orderBy(desc(tradeInsTable.createdAt)).limit(parseInt(limit)).offset(parseInt(offset)),
      db.select({ count: sql<number>`count(*)` }).from(tradeInsTable),
    ]);
    res.json({ tradeIns: tradeIns.map(formatTradeIn), total: Number(countResult[0]?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Error listing trade-ins");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/trade-ins", async (req, res) => {
  try {
    const body = req.body;
    const result = await db.insert(tradeInsTable).values({
      ...body,
      askingPrice: body.askingPrice ? String(body.askingPrice) : null,
    }).returning();
    res.status(201).json(formatTradeIn(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating trade-in");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
