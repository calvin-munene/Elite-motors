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
        phone: "+254 700 234 567",
        whatsapp: "+254700234567",
        email: "sales@autoelitemotors.co.ke",
        address: "Ngong Road, Off Waiyaki Way",
        city: "Nairobi",
        country: "Kenya",
        openingHours: "Mon-Sat: 8AM-6PM | Sun: 10AM-4PM",
        heroTitle: "Find Your Perfect Drive",
        heroSubtitle: "Premium vehicles. Trusted service. Exceptional experience. Kenya's finest automotive dealership.",
        aboutTitle: "About AutoElite Motors",
        aboutContent: "For over 15 years, AutoElite Motors has been Nairobi's most trusted premium car dealership. We specialize in luxury, performance, and premium vehicles with a commitment to exceptional customer service across Kenya.",
        yearsInBusiness: 15,
        carsInStock: 200,
        satisfiedClients: 5000,
        currency: "KES",
        usdToKesRate: 130,
        footerTagline: "Kenya's Premier Automotive Destination",
        metaDescription: "AutoElite Motors - Premium car dealership in Nairobi, Kenya. Browse luxury vehicles, Japanese imports, and premium brands.",
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
