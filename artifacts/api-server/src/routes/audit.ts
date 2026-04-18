import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/admin/audit-logs", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(500, Number(req.query.limit) || 100);
    const entity = req.query.entity as string | undefined;
    const adminUsername = req.query.adminUsername as string | undefined;

    const conditions: any[] = [];
    if (entity) conditions.push(eq(auditLogsTable.entity, entity));
    if (adminUsername) conditions.push(eq(auditLogsTable.adminUsername, adminUsername));

    const query = db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(limit);
    const logs = conditions.length ? await query.where(and(...conditions)) : await query;

    res.json({ logs: logs.map(l => ({ ...l, createdAt: l.createdAt.toISOString() })) });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
