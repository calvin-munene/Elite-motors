import { Router } from "express";
import { db } from "@workspace/db";
import { bookingsTable, inquiriesTable, tradeInsTable, financingInquiriesTable } from "@workspace/db";
import { sql, desc, eq, or } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// GET /api/admin/customers - aggregated customer 360 list
router.get("/admin/customers", requireAdmin, async (req, res) => {
  try {
    const result = await db.execute(sql`
      WITH all_contacts AS (
        SELECT name, email, phone, 'booking' as source, car_title, created_at, lead_score FROM bookings
        UNION ALL
        SELECT name, email, phone, 'inquiry' as source, car_title, created_at, lead_score FROM inquiries
        UNION ALL
        SELECT owner_name as name, email, phone, 'trade-in' as source, NULL as car_title, created_at, NULL as lead_score FROM trade_ins
        UNION ALL
        SELECT name, email, phone, 'financing' as source, car_title, created_at, NULL as lead_score FROM financing_inquiries
      )
      SELECT
        coalesce(phone, email) as contact_key,
        max(name) as name,
        max(email) as email,
        max(phone) as phone,
        count(*) as total_interactions,
        count(*) filter (where source = 'booking') as bookings,
        count(*) filter (where source = 'inquiry') as inquiries,
        count(*) filter (where source = 'trade-in') as trade_ins,
        count(*) filter (where source = 'financing') as financings,
        max(lead_score) as best_lead_score,
        max(created_at) as last_seen,
        min(created_at) as first_seen
      FROM all_contacts
      WHERE coalesce(phone, email) IS NOT NULL
      GROUP BY contact_key
      ORDER BY last_seen DESC
      LIMIT 200
    `);

    res.json({
      customers: (result.rows as any[]).map(r => ({
        contactKey: r.contact_key,
        name: r.name,
        email: r.email,
        phone: r.phone,
        totalInteractions: Number(r.total_interactions),
        bookings: Number(r.bookings),
        inquiries: Number(r.inquiries),
        tradeIns: Number(r.trade_ins),
        financings: Number(r.financings),
        bestLeadScore: r.best_lead_score != null ? Number(r.best_lead_score) : null,
        lastSeen: new Date(r.last_seen).toISOString(),
        firstSeen: new Date(r.first_seen).toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching customers");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/customers/by-contact?phone=X or ?email=Y - full 360 view
router.get("/admin/customers/by-contact", requireAdmin, async (req, res) => {
  try {
    const phone = (req.query.phone as string) || "";
    const email = (req.query.email as string) || "";
    if (!phone && !email) return res.status(400).json({ error: "phone or email required" });

    const matchPhone = phone || "__no_phone__";
    const matchEmail = email || "__no_email__";

    const [bookings, inquiries, tradeIns, financings] = await Promise.all([
      db.select().from(bookingsTable).where(or(eq(bookingsTable.phone, matchPhone), eq(bookingsTable.email, matchEmail))).orderBy(desc(bookingsTable.createdAt)),
      db.select().from(inquiriesTable).where(or(eq(inquiriesTable.phone, matchPhone), eq(inquiriesTable.email, matchEmail))).orderBy(desc(inquiriesTable.createdAt)),
      db.select().from(tradeInsTable).where(or(eq(tradeInsTable.phone, matchPhone), eq(tradeInsTable.email, matchEmail))).orderBy(desc(tradeInsTable.createdAt)),
      db.select().from(financingInquiriesTable).where(or(eq(financingInquiriesTable.phone, matchPhone), eq(financingInquiriesTable.email, matchEmail))).orderBy(desc(financingInquiriesTable.createdAt)),
    ]);

    res.json({
      bookings: bookings.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })),
      inquiries: inquiries.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })),
      tradeIns: tradeIns.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })),
      financings: financings.map(f => ({ ...f, createdAt: f.createdAt.toISOString() })),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
