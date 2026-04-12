import { Router } from "express";
import { db } from "@workspace/db";
import { financingInquiriesTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router = Router();

function formatFinancing(f: typeof financingInquiriesTable.$inferSelect) {
  return {
    ...f,
    loanAmount: f.loanAmount ? Number(f.loanAmount) : null,
    downPayment: f.downPayment ? Number(f.downPayment) : null,
    createdAt: f.createdAt.toISOString(),
  };
}

router.get("/financing", async (req, res) => {
  try {
    const { limit = "20", offset = "0" } = req.query as Record<string, string>;
    const [inquiries, countResult] = await Promise.all([
      db.select().from(financingInquiriesTable).orderBy(desc(financingInquiriesTable.createdAt)).limit(parseInt(limit)).offset(parseInt(offset)),
      db.select({ count: sql<number>`count(*)` }).from(financingInquiriesTable),
    ]);
    res.json({ inquiries: inquiries.map(formatFinancing), total: Number(countResult[0]?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Error listing financing inquiries");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/financing", async (req, res) => {
  try {
    const body = req.body;
    const result = await db.insert(financingInquiriesTable).values({
      ...body,
      loanAmount: body.loanAmount ? String(body.loanAmount) : null,
      downPayment: body.downPayment ? String(body.downPayment) : null,
    }).returning();
    res.status(201).json(formatFinancing(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating financing inquiry");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
