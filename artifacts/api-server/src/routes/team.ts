import { Router } from "express";
import { db } from "@workspace/db";
import { teamMembersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

function formatMember(m: typeof teamMembersTable.$inferSelect) {
  return { ...m, createdAt: m.createdAt.toISOString() };
}

router.get("/team", async (req, res) => {
  try {
    const members = await db.select().from(teamMembersTable).orderBy(asc(teamMembersTable.sortOrder));
    res.json(members.map(formatMember));
  } catch (err) {
    req.log.error({ err }, "Error listing team members");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/team", async (req, res) => {
  try {
    const result = await db.insert(teamMembersTable).values(req.body).returning();
    res.status(201).json(formatMember(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating team member");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/team/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(teamMembersTable).set(req.body).where(eq(teamMembersTable.id, id)).returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatMember(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating team member");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/team/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting team member");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
