import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable, carsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin, logAudit, getClientIp } from "../middlewares/auth";

const router = Router();

async function getCloudCreds() {
  const rows = await db.select().from(siteSettingsTable).where(inArray(siteSettingsTable.key, [
    "whatsappCloudToken", "whatsappCloudPhoneId", "whatsappCloudEnabled"
  ]));
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    token: map.whatsappCloudToken,
    phoneId: map.whatsappCloudPhoneId,
    enabled: map.whatsappCloudEnabled === "true",
  };
}

// POST /api/admin/whatsapp/send - body { to, message, mediaUrl?, type? }
router.post("/admin/whatsapp/send", requireAdmin, async (req: any, res) => {
  try {
    const { to, message, mediaUrl, type } = req.body;
    if (!to || (!message && !mediaUrl)) return res.status(400).json({ error: "Recipient and message required" });

    const creds = await getCloudCreds();

    if (!creds.enabled || !creds.token || !creds.phoneId) {
      // Fallback: return a wa.me link the admin can click
      const cleanTo = to.replace(/\D/g, "");
      const text = encodeURIComponent(message || "");
      return res.json({
        method: "fallback_link",
        url: `https://wa.me/${cleanTo}?text=${text}`,
        note: "WhatsApp Cloud API not configured. Click the link to send manually. Configure in Settings → Integrations to enable automatic sending.",
      });
    }

    // WhatsApp Cloud API call
    const cleanTo = to.replace(/\D/g, "");
    const payload: any = {
      messaging_product: "whatsapp",
      to: cleanTo,
      type: mediaUrl ? (type || "image") : "text",
    };
    if (mediaUrl) {
      payload[type || "image"] = { link: mediaUrl, caption: message || "" };
    } else {
      payload.text = { body: message };
    }

    const resp = await fetch(`https://graph.facebook.com/v20.0/${creds.phoneId}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${creds.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: "WhatsApp API error", detail: data });

    await logAudit({
      adminId: req.adminUserId, adminUsername: req.adminUsername,
      action: "send_whatsapp", entity: "whatsapp", entityId: cleanTo,
      changes: { to: cleanTo, hasMedia: !!mediaUrl },
      ipAddress: getClientIp(req), userAgent: req.headers["user-agent"],
    });

    res.json({ method: "cloud_api", success: true, response: data });
  } catch (err: any) {
    res.status(500).json({ error: "WhatsApp send failed", detail: err.message });
  }
});

// POST /api/admin/whatsapp/send-brochure - body { to, carId }
router.post("/admin/whatsapp/send-brochure", requireAdmin, async (req: any, res) => {
  try {
    const { to, carId } = req.body;
    if (!to || !carId) return res.status(400).json({ error: "to and carId required" });

    const cars = await db.select().from(carsTable).where(eq(carsTable.id, Number(carId)));
    const car = cars[0];
    if (!car) return res.status(404).json({ error: "Car not found" });

    const priceKes = Number(car.price) * 130;
    const message = `*${car.year} ${car.title}*\n\n💰 KES ${new Intl.NumberFormat("en-KE").format(priceKes)}\n📊 ${new Intl.NumberFormat().format(car.mileage)} km\n⚙️ ${car.transmission} · ${car.fuelType}\n🎨 ${car.color}\n\n${car.shortDescription || ""}\n\nView full details: https://autoelitemotors.co.ke/cars/${car.slug}\n\n— AutoElite Motors\nNgong Road, Nairobi`;

    // Reuse send endpoint
    const creds = await getCloudCreds();
    const mediaUrl = car.gallery?.[0];

    if (!creds.enabled || !creds.token || !creds.phoneId) {
      const cleanTo = to.replace(/\D/g, "");
      return res.json({
        method: "fallback_link",
        url: `https://wa.me/${cleanTo}?text=${encodeURIComponent(message)}`,
        note: "WhatsApp Cloud API not configured.",
      });
    }

    const cleanTo = to.replace(/\D/g, "");
    const payload: any = {
      messaging_product: "whatsapp",
      to: cleanTo,
      type: mediaUrl ? "image" : "text",
    };
    if (mediaUrl) payload.image = { link: mediaUrl, caption: message };
    else payload.text = { body: message };

    const resp = await fetch(`https://graph.facebook.com/v20.0/${creds.phoneId}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${creds.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: "WhatsApp API error", detail: data });
    res.json({ method: "cloud_api", success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Brochure send failed", detail: err.message });
  }
});

router.get("/admin/whatsapp/status", requireAdmin, async (req, res) => {
  const creds = await getCloudCreds();
  res.json({
    enabled: creds.enabled,
    configured: !!(creds.token && creds.phoneId),
    phoneId: creds.phoneId ? `••••${creds.phoneId.slice(-4)}` : null,
  });
});

export default router;
