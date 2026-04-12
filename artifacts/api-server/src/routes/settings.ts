import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function formatSettings(s: typeof siteSettingsTable.$inferSelect) {
  return { ...s, updatedAt: s.updatedAt.toISOString() };
}

router.get("/settings", async (req, res) => {
  try {
    const settings = await db.select().from(siteSettingsTable).limit(1);
    if (!settings[0]) {
      const defaultSettings = await db.insert(siteSettingsTable).values({
        dealerName: "AutoElite Motors",
        tagline: "Drive Your Dream",
        phone: "+1 (555) 234-5678",
        whatsapp: "+15552345678",
        email: "sales@autoelitemotors.com",
        address: "4820 Automotive Boulevard",
        city: "Los Angeles, CA 90001",
        openingHours: "Mon-Sat: 9AM-7PM | Sun: 11AM-5PM",
        heroTitle: "Find Your Perfect Drive",
        heroSubtitle: "Premium vehicles. Trusted service. Exceptional experience.",
        aboutTitle: "About AutoElite Motors",
        aboutContent: "For over 15 years, AutoElite Motors has been Los Angeles's most trusted premium car dealership. We specialize in luxury, performance, and premium vehicles with a commitment to exceptional customer service.",
        yearsInBusiness: 15,
        carsInStock: 200,
        satisfiedClients: 5000,
      }).returning();
      return res.json(formatSettings(defaultSettings[0]));
    }
    res.json(formatSettings(settings[0]));
  } catch (err) {
    req.log.error({ err }, "Error getting settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const existing = await db.select().from(siteSettingsTable).limit(1);
    let result;
    if (!existing[0]) {
      result = await db.insert(siteSettingsTable).values({ ...req.body, updatedAt: new Date() }).returning();
    } else {
      result = await db.update(siteSettingsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(siteSettingsTable.id, existing[0].id)).returning();
    }
    res.json(formatSettings(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
