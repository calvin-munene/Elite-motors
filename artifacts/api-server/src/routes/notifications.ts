import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/admin/notifications", requireAdmin, async (req, res) => {
  try {
    const [items, unreadCount] = await Promise.all([
      db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt)).limit(50),
      db.select({ count: sql<number>`count(*)` }).from(notificationsTable).where(eq(notificationsTable.isRead, false)),
    ]);
    res.json({
      notifications: items.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })),
      unreadCount: Number(unreadCount[0]?.count ?? 0),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/notifications/:id/read", requireAdmin, async (req, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/notifications/read-all", requireAdmin, async (req, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.isRead, false));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/notifications/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(notificationsTable).where(eq(notificationsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
