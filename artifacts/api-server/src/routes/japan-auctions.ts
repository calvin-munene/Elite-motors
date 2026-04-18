import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// Japanese auction houses (USS, TAA, HAA) do not provide public dealer APIs.
// Most Kenyan dealers integrate through paid aggregators:
//   - BeForward Dealer API
//   - SBT Japan dealer feed
//   - JapanCarDirect partner feed
// This route is a configuration-driven scaffold: admin sets provider URL + token,
// and we proxy the call. Without configuration, returns a clear status message.

router.get("/admin/japan-auctions/status", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable).where(inArray(siteSettingsTable.key, [
      "japanAuctionProvider", "japanAuctionFeedUrl", "japanAuctionApiKey", "japanAuctionEnabled"
    ]));
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    res.json({
      configured: !!(map.japanAuctionFeedUrl && map.japanAuctionApiKey),
      enabled: map.japanAuctionEnabled === "true",
      provider: map.japanAuctionProvider || null,
      feedUrl: map.japanAuctionFeedUrl ? `${map.japanAuctionFeedUrl.slice(0, 40)}...` : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/japan-auctions/sync", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable).where(inArray(siteSettingsTable.key, [
      "japanAuctionFeedUrl", "japanAuctionApiKey", "japanAuctionEnabled"
    ]));
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;

    if (map.japanAuctionEnabled !== "true" || !map.japanAuctionFeedUrl || !map.japanAuctionApiKey) {
      return res.status(400).json({
        error: "Not configured",
        message: "Configure a Japan auction feed in Settings → Integrations. Recommended providers: BeForward Dealer API, SBT Japan, JapanCarDirect partner feed.",
      });
    }

    // Generic proxy: expect JSON array of cars
    const resp = await fetch(map.japanAuctionFeedUrl, {
      headers: { "Authorization": `Bearer ${map.japanAuctionApiKey}` },
    });
    if (!resp.ok) return res.status(502).json({ error: "Provider error", status: resp.status });

    const data = await resp.json();
    const items = Array.isArray(data) ? data : (data.items || data.cars || []);

    res.json({
      success: true,
      received: items.length,
      preview: items.slice(0, 3),
      note: "Configure mapping rules to import these into your inventory.",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Sync failed", detail: err.message });
  }
});

// KRA Import Duty calculator helper
router.post("/admin/japan-auctions/calculate-duty", requireAdmin, async (req, res) => {
  try {
    const { cifUsd, engineCC, isElectric } = req.body;
    const cif = Number(cifUsd) || 0;
    const cc = Number(engineCC) || 0;

    // KRA breakdown
    const importDuty = cif * 0.25;
    let exciseRate = 0.20;
    if (isElectric) exciseRate = 0.25;
    else if (cc > 2500) exciseRate = 0.35;
    else if (cc > 1500) exciseRate = 0.25;
    const exciseDuty = (cif + importDuty) * exciseRate;
    const vatBase = cif + importDuty + exciseDuty;
    const vat = vatBase * 0.16;
    const idf = cif * 0.035;
    const rdl = cif * 0.02;
    const total = importDuty + exciseDuty + vat + idf + rdl;
    const landed = cif + total;

    res.json({
      cifUsd: cif,
      breakdown: {
        importDuty: +importDuty.toFixed(2),
        exciseDuty: +exciseDuty.toFixed(2),
        vat: +vat.toFixed(2),
        idf: +idf.toFixed(2),
        rdl: +rdl.toFixed(2),
        totalTax: +total.toFixed(2),
      },
      landedCostUsd: +landed.toFixed(2),
      landedCostKes: +(landed * 130).toFixed(0),
    });
  } catch (err) {
    res.status(500).json({ error: "Calculation failed" });
  }
});

export default router;
