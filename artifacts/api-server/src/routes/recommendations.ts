import { Router } from "express";
import { db } from "@workspace/db";
import { carsTable, carViewsTable } from "@workspace/db";
import { eq, sql, and, inArray, ne } from "drizzle-orm";

const router = Router();

// GET /api/recommendations?sessionId=X
// Returns personalized recs based on browsing history; falls back to featured cars.
router.get("/recommendations", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string | undefined;
    const limit = Math.min(12, Number(req.query.limit) || 6);

    let recommended: any[] = [];

    if (sessionId) {
      // Find cars they've viewed
      const viewedRows = await db.execute(sql`
        SELECT DISTINCT car_id FROM car_views WHERE session_id = ${sessionId} ORDER BY car_id LIMIT 20
      `);
      const viewedIds = (viewedRows.rows as any[]).map(r => Number(r.car_id));

      if (viewedIds.length > 0) {
        // Get their profile (most viewed body types, makes, price range)
        const profile = await db.execute(sql`
          SELECT body_type, make, avg(CAST(price as float)) as avg_price
          FROM cars
          WHERE id = ANY(${viewedIds})
          GROUP BY body_type, make
          ORDER BY count(*) DESC
          LIMIT 5
        `);

        const profileRows = profile.rows as any[];
        if (profileRows.length > 0) {
          const bodyTypes = [...new Set(profileRows.map(p => p.body_type).filter(Boolean))];
          const makes = [...new Set(profileRows.map(p => p.make).filter(Boolean))];
          const avgPrice = profileRows.reduce((s, p) => s + Number(p.avg_price || 0), 0) / profileRows.length;
          const minPrice = avgPrice * 0.6;
          const maxPrice = avgPrice * 1.5;

          const recs = await db.execute(sql`
            SELECT * FROM cars
            WHERE is_published = true
              AND id != ALL(${viewedIds})
              AND (body_type = ANY(${bodyTypes}) OR make = ANY(${makes}))
              AND CAST(price as float) BETWEEN ${minPrice} AND ${maxPrice}
            ORDER BY
              (CASE WHEN body_type = ANY(${bodyTypes}) THEN 2 ELSE 0 END) +
              (CASE WHEN make = ANY(${makes}) THEN 1 ELSE 0 END) DESC,
              view_count DESC
            LIMIT ${limit}
          `);
          recommended = recs.rows as any[];
        }
      }
    }

    // Fallback: featured/popular
    if (recommended.length < limit) {
      const fallbackRaw = await db.execute(sql`
        SELECT * FROM cars
        WHERE is_published = true AND availability = 'available'
        ORDER BY is_featured DESC, view_count DESC, created_at DESC
        LIMIT ${limit - recommended.length}
      `);
      const existingIds = new Set(recommended.map(r => Number(r.id)));
      for (const c of fallbackRaw.rows as any[]) {
        if (!existingIds.has(Number(c.id))) recommended.push(c);
      }
    }

    res.json({
      personalized: !!sessionId && recommended.length > 0 && recommended[0]._matched !== false,
      cars: recommended.slice(0, limit).map(c => ({
        id: Number(c.id),
        slug: c.slug,
        title: c.title,
        make: c.make,
        model: c.model,
        year: Number(c.year),
        price: Number(c.price),
        discountedPrice: c.discounted_price ? Number(c.discounted_price) : null,
        mileage: Number(c.mileage),
        bodyType: c.body_type,
        transmission: c.transmission,
        fuelType: c.fuel_type,
        color: c.color,
        gallery: c.gallery,
        availability: c.availability,
        isFeatured: !!c.is_featured,
        category: c.category,
      })),
    });
  } catch (err: any) {
    req.log?.error({ err }, "Recommendations failed");
    res.status(500).json({ error: "Recommendations failed", detail: err.message });
  }
});

export default router;
