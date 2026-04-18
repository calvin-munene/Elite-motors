import { Router } from "express";
import { db } from "@workspace/db";
import { bookingsTable, carsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { scoreLead } from "../lib/lead-scoring";
import { createNotification } from "../lib/notifications";

const router = Router();

function formatBooking(b: typeof bookingsTable.$inferSelect) {
  return { ...b, createdAt: b.createdAt.toISOString() };
}

router.get("/bookings", async (req, res) => {
  try {
    const { status, limit = "20", offset = "0" } = req.query as Record<string, string>;
    const whereClause = status ? eq(bookingsTable.status, status) : undefined;
    const [bookings, countResult] = await Promise.all([
      db.select().from(bookingsTable).where(whereClause).orderBy(desc(bookingsTable.createdAt)).limit(parseInt(limit)).offset(parseInt(offset)),
      db.select({ count: sql<number>`count(*)` }).from(bookingsTable).where(whereClause),
    ]);
    res.json({ bookings: bookings.map(formatBooking), total: Number(countResult[0]?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Error listing bookings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bookings", async (req, res) => {
  try {
    let carPrice: number | null = null;
    if (req.body.carId) {
      const cars = await db.select().from(carsTable).where(eq(carsTable.id, Number(req.body.carId)));
      if (cars[0]) carPrice = Number(cars[0].price);
    }

    const score = scoreLead({
      name: req.body.name, email: req.body.email, phone: req.body.phone,
      message: req.body.message, carPrice, hasCarSelected: !!req.body.carId,
      preferredDate: req.body.preferredDate,
    });

    const result = await db.insert(bookingsTable).values({
      ...req.body,
      leadScore: score.score,
      leadLevel: score.level,
    }).returning();

    await createNotification({
      type: "booking",
      title: score.level === "hot" ? "🔥 HOT Test Drive Booking" : `New Test Drive Booking`,
      message: `${req.body.name} booked${req.body.carTitle ? ` ${req.body.carTitle}` : " a test drive"} (Lead score: ${score.score})`,
      link: "/admin/bookings",
      priority: score.level === "hot" ? "urgent" : "normal",
    });

    res.status(201).json(formatBooking(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/bookings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(bookingsTable).set(req.body).where(eq(bookingsTable.id, id)).returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatBooking(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
