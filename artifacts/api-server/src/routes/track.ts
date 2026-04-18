import { Router } from "express";
import { db } from "@workspace/db";
import { visitorSessionsTable, pageViewsTable, carViewsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getClientIp } from "../middlewares/auth";

const router = Router();

function parseUserAgent(ua: string) {
  const lower = ua.toLowerCase();
  let browser = "Unknown";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome")) browser = "Chrome";
  else if (lower.includes("safari")) browser = "Safari";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("opera") || lower.includes("opr/")) browser = "Opera";

  let os = "Unknown";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad")) os = "iOS";
  else if (lower.includes("linux")) os = "Linux";

  let device = "Desktop";
  if (lower.includes("mobile") || lower.includes("iphone") || lower.includes("android")) device = "Mobile";
  else if (lower.includes("ipad") || lower.includes("tablet")) device = "Tablet";

  return { browser, os, device };
}

// POST /api/track/session - upsert session
router.post("/track/session", async (req, res) => {
  try {
    const { sessionId, path, title, referrer } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const ipAddress = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const { browser, os, device } = parseUserAgent(userAgent);

    const existing = await db.select().from(visitorSessionsTable).where(eq(visitorSessionsTable.sessionId, sessionId));

    if (existing.length === 0) {
      await db.insert(visitorSessionsTable).values({
        sessionId,
        ipAddress,
        userAgent,
        browser,
        os,
        device,
        referrer: referrer || null,
        landingPage: path || "/",
        pageViews: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
      });
    } else {
      await db.update(visitorSessionsTable)
        .set({
          lastSeen: new Date(),
          pageViews: sql`${visitorSessionsTable.pageViews} + 1`,
          totalDurationSeconds: sql`${visitorSessionsTable.totalDurationSeconds} + GREATEST(0, EXTRACT(EPOCH FROM (NOW() - ${visitorSessionsTable.lastSeen}))::int)`,
        })
        .where(eq(visitorSessionsTable.sessionId, sessionId));
    }

    if (path) {
      await db.insert(pageViewsTable).values({
        sessionId,
        path,
        title: title || null,
        referrer: referrer || null,
      });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error tracking session");
    res.status(500).json({ error: "Tracking failed" });
  }
});

// POST /api/track/car - record car detail view
router.post("/track/car", async (req, res) => {
  try {
    const { sessionId, carId } = req.body;
    if (!sessionId || !carId) return res.status(400).json({ error: "sessionId and carId required" });
    await db.insert(carViewsTable).values({ sessionId, carId: Number(carId) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Tracking failed" });
  }
});

// POST /api/track/duration - update page duration
router.post("/track/duration", async (req, res) => {
  try {
    const { sessionId, durationSeconds } = req.body;
    if (!sessionId || typeof durationSeconds !== "number") return res.status(400).json({ error: "Invalid input" });
    await db.update(visitorSessionsTable)
      .set({
        totalDurationSeconds: sql`${visitorSessionsTable.totalDurationSeconds} + ${Math.max(0, Math.min(3600, Math.floor(durationSeconds)))}`,
        lastSeen: new Date(),
      })
      .where(eq(visitorSessionsTable.sessionId, sessionId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Tracking failed" });
  }
});

export default router;
