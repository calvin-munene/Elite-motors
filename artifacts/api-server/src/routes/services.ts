import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

function formatService(s: typeof servicesTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

router.get("/services", async (req, res) => {
  try {
    const services = await db.select().from(servicesTable).orderBy(asc(servicesTable.sortOrder));
    res.json(services.map(formatService));
  } catch (err) {
    req.log.error({ err }, "Error listing services");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/services", async (req, res) => {
  try {
    const result = await db.insert(servicesTable).values(req.body).returning();
    res.status(201).json(formatService(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(servicesTable).set(req.body).where(eq(servicesTable.id, id)).returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatService(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting service");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
