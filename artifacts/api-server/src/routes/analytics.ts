import { Router } from "express";
import { db } from "@workspace/db";
import { carsTable, bookingsTable, inquiriesTable, visitorSessionsTable, carViewsTable, pageViewsTable, tradeInsTable, financingInquiriesTable } from "@workspace/db";
import { sql, desc, eq, and, gte } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// GET /api/admin/analytics - main analytics dashboard
router.get("/admin/analytics", requireAdmin, async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalVisitors, returningVisitors,
      totalPageViews, totalCarViews,
      totalBookings, totalInquiries, totalSold,
      totalRevenueRaw,
      visitsByDayRaw,
      bookingsByDayRaw,
      topCarsRaw,
      topBodyTypesRaw,
      topReferrersRaw,
      deviceBreakdownRaw,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(visitorSessionsTable).where(gte(visitorSessionsTable.firstSeen, since)),
      db.select({ count: sql<number>`count(*)` }).from(visitorSessionsTable).where(and(gte(visitorSessionsTable.firstSeen, since), sql`${visitorSessionsTable.pageViews} > 1`)),
      db.select({ count: sql<number>`count(*)` }).from(pageViewsTable).where(gte(pageViewsTable.viewedAt, since)),
      db.select({ count: sql<number>`count(*)` }).from(carViewsTable).where(gte(carViewsTable.viewedAt, since)),
      db.select({ count: sql<number>`count(*)` }).from(bookingsTable).where(gte(bookingsTable.createdAt, since)),
      db.select({ count: sql<number>`count(*)` }).from(inquiriesTable).where(gte(inquiriesTable.createdAt, since)),
      db.select({ count: sql<number>`count(*)` }).from(carsTable).where(eq(carsTable.availability, "sold")),
      db.select({ total: sql<string>`coalesce(sum(${carsTable.price}), 0)` }).from(carsTable).where(eq(carsTable.availability, "sold")),
      db.execute(sql`
        SELECT to_char(date_trunc('day', first_seen), 'YYYY-MM-DD') as day,
               count(*) as visits
        FROM visitor_sessions
        WHERE first_seen >= ${since}
        GROUP BY day ORDER BY day ASC
      `),
      db.execute(sql`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
               count(*) as bookings
        FROM bookings
        WHERE created_at >= ${since}
        GROUP BY day ORDER BY day ASC
      `),
      db.execute(sql`
        SELECT c.id, c.title, c.make, c.model, c.year, c.price,
               (SELECT count(*) FROM car_views cv WHERE cv.car_id = c.id AND cv.viewed_at >= ${since}) as views
        FROM cars c
        WHERE c.is_published = true
        ORDER BY views DESC
        LIMIT 10
      `),
      db.execute(sql`
        SELECT body_type, count(*) as count
        FROM cars
        WHERE is_published = true
        GROUP BY body_type
        ORDER BY count DESC
        LIMIT 8
      `),
      db.execute(sql`
        SELECT coalesce(referrer, 'Direct') as referrer, count(*) as visits
        FROM visitor_sessions
        WHERE first_seen >= ${since}
        GROUP BY referrer
        ORDER BY visits DESC
        LIMIT 10
      `),
      db.execute(sql`
        SELECT coalesce(device, 'Unknown') as device, count(*) as count
        FROM visitor_sessions
        WHERE first_seen >= ${since}
        GROUP BY device
        ORDER BY count DESC
      `),
    ]);

    res.json({
      period: { days, since: since.toISOString() },
      totals: {
        visitors: Number(totalVisitors[0]?.count ?? 0),
        returningVisitors: Number(returningVisitors[0]?.count ?? 0),
        pageViews: Number(totalPageViews[0]?.count ?? 0),
        carViews: Number(totalCarViews[0]?.count ?? 0),
        bookings: Number(totalBookings[0]?.count ?? 0),
        inquiries: Number(totalInquiries[0]?.count ?? 0),
        soldCars: Number(totalSold[0]?.count ?? 0),
        totalRevenue: Number(totalRevenueRaw[0]?.total ?? 0),
      },
      funnel: {
        visits: Number(totalVisitors[0]?.count ?? 0),
        carViews: Number(totalCarViews[0]?.count ?? 0),
        inquiries: Number(totalInquiries[0]?.count ?? 0),
        bookings: Number(totalBookings[0]?.count ?? 0),
        sold: Number(totalSold[0]?.count ?? 0),
      },
      visitsByDay: (visitsByDayRaw.rows as any[]).map(r => ({ day: r.day, visits: Number(r.visits) })),
      bookingsByDay: (bookingsByDayRaw.rows as any[]).map(r => ({ day: r.day, bookings: Number(r.bookings) })),
      topCars: (topCarsRaw.rows as any[]).map(r => ({
        id: Number(r.id), title: r.title, make: r.make, model: r.model,
        year: Number(r.year), price: Number(r.price), views: Number(r.views),
      })),
      topBodyTypes: (topBodyTypesRaw.rows as any[]).map(r => ({ bodyType: r.body_type, count: Number(r.count) })),
      topReferrers: (topReferrersRaw.rows as any[]).map(r => ({ referrer: r.referrer, visits: Number(r.visits) })),
      deviceBreakdown: (deviceBreakdownRaw.rows as any[]).map(r => ({ device: r.device, count: Number(r.count) })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/visitors - list of visitor sessions
router.get("/admin/visitors", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(200, Number(req.query.limit) || 50);
    const sessions = await db.select().from(visitorSessionsTable).orderBy(desc(visitorSessionsTable.lastSeen)).limit(limit);
    res.json({
      sessions: sessions.map(s => ({
        ...s,
        firstSeen: s.firstSeen.toISOString(),
        lastSeen: s.lastSeen.toISOString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/visitors/:sessionId - detailed visitor activity
router.get("/admin/visitors/:sessionId", requireAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const [session, pages, cars] = await Promise.all([
      db.select().from(visitorSessionsTable).where(eq(visitorSessionsTable.sessionId, sessionId)),
      db.select().from(pageViewsTable).where(eq(pageViewsTable.sessionId, sessionId)).orderBy(desc(pageViewsTable.viewedAt)).limit(200),
      db.execute(sql`
        SELECT cv.viewed_at, cv.car_id, c.title, c.make, c.model, c.year, c.price, c.slug
        FROM car_views cv
        LEFT JOIN cars c ON c.id = cv.car_id
        WHERE cv.session_id = ${sessionId}
        ORDER BY cv.viewed_at DESC
        LIMIT 100
      `),
    ]);

    if (!session[0]) return res.status(404).json({ error: "Session not found" });

    res.json({
      session: { ...session[0], firstSeen: session[0].firstSeen.toISOString(), lastSeen: session[0].lastSeen.toISOString() },
      pageViews: pages.map(p => ({ ...p, viewedAt: p.viewedAt.toISOString() })),
      carViews: (cars.rows as any[]).map(r => ({
        viewedAt: new Date(r.viewed_at).toISOString(),
        carId: Number(r.car_id),
        title: r.title, make: r.make, model: r.model, year: r.year ? Number(r.year) : null,
        price: r.price ? Number(r.price) : null, slug: r.slug,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
