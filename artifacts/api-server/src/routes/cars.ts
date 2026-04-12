import { Router } from "express";
import { db } from "@workspace/db";
import { carsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, sql, desc, asc, or } from "drizzle-orm";

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatCar(car: typeof carsTable.$inferSelect) {
  return {
    ...car,
    price: Number(car.price),
    discountedPrice: car.discountedPrice ? Number(car.discountedPrice) : null,
    features: (car.features as string[]) || [],
    safetyFeatures: (car.safetyFeatures as string[]) || [],
    comfortFeatures: (car.comfortFeatures as string[]) || [],
    techFeatures: (car.techFeatures as string[]) || [],
    gallery: (car.gallery as string[]) || [],
    createdAt: car.createdAt.toISOString(),
    updatedAt: car.updatedAt.toISOString(),
  };
}

router.get("/cars", async (req, res) => {
  try {
    const {
      make, model, yearMin, yearMax, priceMin, priceMax,
      bodyType, fuelType, transmission, condition, color,
      availability, featured, category, sortBy, limit = "20",
      offset = "0", search
    } = req.query as Record<string, string>;

    const conditions = [];

    if (make) conditions.push(ilike(carsTable.make, `%${make}%`));
    if (model) conditions.push(ilike(carsTable.model, `%${model}%`));
    if (yearMin) conditions.push(gte(carsTable.year, parseInt(yearMin)));
    if (yearMax) conditions.push(lte(carsTable.year, parseInt(yearMax)));
    if (priceMin) conditions.push(gte(sql`${carsTable.price}::numeric`, parseFloat(priceMin)));
    if (priceMax) conditions.push(lte(sql`${carsTable.price}::numeric`, parseFloat(priceMax)));
    if (bodyType) conditions.push(ilike(carsTable.bodyType, `%${bodyType}%`));
    if (fuelType) conditions.push(ilike(carsTable.fuelType, `%${fuelType}%`));
    if (transmission) conditions.push(ilike(carsTable.transmission, `%${transmission}%`));
    if (condition) conditions.push(eq(carsTable.condition, condition));
    if (color) conditions.push(ilike(carsTable.color, `%${color}%`));
    if (availability) conditions.push(eq(carsTable.availability, availability));
    if (featured === "true") conditions.push(eq(carsTable.isFeatured, true));
    if (category) conditions.push(ilike(carsTable.category, `%${category}%`));
    if (search) {
      conditions.push(
        or(
          ilike(carsTable.title, `%${search}%`),
          ilike(carsTable.make, `%${search}%`),
          ilike(carsTable.model, `%${search}%`),
        )!
      );
    }

    conditions.push(eq(carsTable.isPublished, true));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy;
    switch (sortBy) {
      case "price_asc": orderBy = asc(sql`${carsTable.price}::numeric`); break;
      case "price_desc": orderBy = desc(sql`${carsTable.price}::numeric`); break;
      case "oldest": orderBy = asc(carsTable.createdAt); break;
      case "mileage_asc": orderBy = asc(carsTable.mileage); break;
      case "featured": orderBy = desc(carsTable.isFeatured); break;
      default: orderBy = desc(carsTable.createdAt);
    }

    const [cars, countResult] = await Promise.all([
      db.select().from(carsTable)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string)),
      db.select({ count: sql<number>`count(*)` }).from(carsTable).where(whereClause),
    ]);

    res.json({
      cars: cars.map(formatCar),
      total: Number(countResult[0]?.count ?? 0),
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing cars");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cars/featured", async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || "6");
    const cars = await db.select().from(carsTable)
      .where(and(eq(carsTable.isFeatured, true), eq(carsTable.isPublished, true)))
      .orderBy(desc(carsTable.createdAt))
      .limit(limit);
    res.json(cars.map(formatCar));
  } catch (err) {
    req.log.error({ err }, "Error getting featured cars");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cars/stats", async (req, res) => {
  try {
    const [total, available, sold, reserved, featured, avgPriceResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(carsTable),
      db.select({ count: sql<number>`count(*)` }).from(carsTable).where(eq(carsTable.availability, "available")),
      db.select({ count: sql<number>`count(*)` }).from(carsTable).where(eq(carsTable.availability, "sold")),
      db.select({ count: sql<number>`count(*)` }).from(carsTable).where(eq(carsTable.availability, "reserved")),
      db.select({ count: sql<number>`count(*)` }).from(carsTable).where(eq(carsTable.isFeatured, true)),
      db.select({ avg: sql<number>`avg(${carsTable.price}::numeric)` }).from(carsTable).where(eq(carsTable.isPublished, true)),
    ]);
    res.json({
      total: Number(total[0]?.count ?? 0),
      available: Number(available[0]?.count ?? 0),
      sold: Number(sold[0]?.count ?? 0),
      reserved: Number(reserved[0]?.count ?? 0),
      featured: Number(featured[0]?.count ?? 0),
      avgPrice: Number(avgPriceResult[0]?.avg ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting car stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cars/makes", async (req, res) => {
  try {
    const makes = await db.selectDistinct({ make: carsTable.make }).from(carsTable)
      .where(eq(carsTable.isPublished, true))
      .orderBy(asc(carsTable.make));
    res.json(makes.map(m => m.make));
  } catch (err) {
    req.log.error({ err }, "Error getting makes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cars/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      // Try slug
      const cars = await db.select().from(carsTable).where(eq(carsTable.slug, req.params.id));
      if (!cars[0]) return res.status(404).json({ error: "Not found" });
      return res.json(formatCar(cars[0]));
    }
    const cars = await db.select().from(carsTable).where(eq(carsTable.id, id));
    if (!cars[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatCar(cars[0]));
  } catch (err) {
    req.log.error({ err }, "Error getting car");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cars/:id/slug", async (req, res) => {
  try {
    const cars = await db.select().from(carsTable).where(eq(carsTable.slug, req.params.id));
    if (!cars[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatCar(cars[0]));
  } catch (err) {
    req.log.error({ err }, "Error getting car by slug");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cars/:id/related", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt((req.query.limit as string) || "4");
    const car = await db.select().from(carsTable).where(eq(carsTable.id, id));
    if (!car[0]) return res.status(404).json({ error: "Not found" });

    const related = await db.select().from(carsTable)
      .where(
        and(
          eq(carsTable.isPublished, true),
          eq(carsTable.bodyType, car[0].bodyType),
          sql`${carsTable.id} != ${id}`,
        )
      )
      .limit(limit);
    res.json(related.map(formatCar));
  } catch (err) {
    req.log.error({ err }, "Error getting related cars");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cars", async (req, res) => {
  try {
    const body = req.body;
    const slug = body.slug || slugify(`${body.year}-${body.make}-${body.model}-${body.trim || ""}`);
    const result = await db.insert(carsTable).values({
      ...body,
      slug,
      price: String(body.price),
      discountedPrice: body.discountedPrice ? String(body.discountedPrice) : null,
    }).returning();
    res.status(201).json(formatCar(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating car");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/cars/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const result = await db.update(carsTable)
      .set({
        ...body,
        price: body.price ? String(body.price) : undefined,
        discountedPrice: body.discountedPrice ? String(body.discountedPrice) : null,
        updatedAt: new Date(),
      })
      .where(eq(carsTable.id, id))
      .returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatCar(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating car");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cars/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(carsTable).where(eq(carsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting car");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
