import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db";

const router: IRouter = Router();

function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function getApiBase(): string {
  const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

let cachedToken: { token: string; exp: number } | null = null;
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 30_000) return cachedToken.token;
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");
  const r = await fetch(`${getApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`PayPal token failed (${r.status}): ${t}`);
  }
  const j = (await r.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cachedToken.token;
}

const DEFAULT_DEPOSIT_USD = Number(process.env.PAYPAL_DEFAULT_DEPOSIT_USD || "30");

// Public: report PayPal config so the frontend can decide what UI to show
router.get("/paypal/config", (_req, res) => {
  res.json({
    configured: isPayPalConfigured(),
    clientId: process.env.PAYPAL_CLIENT_ID || null,
    mode: process.env.PAYPAL_MODE || "sandbox",
    defaultDepositUsd: DEFAULT_DEPOSIT_USD,
    currency: "USD",
  });
});

const CreateOrderBody = z.object({
  bookingId: z.number().int().positive(),
  amountUsd: z.number().positive().optional(),
});

router.post("/paypal/create-order", async (req: Request, res: Response) => {
  if (!isPayPalConfigured()) {
    res.status(503).json({ error: "PayPal is not configured on this server." });
    return;
  }
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  try {
    const { bookingId, amountUsd } = parsed.data;
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId)).limit(1);
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (booking.paymentStatus === "paid") {
      res.status(400).json({ error: "Deposit already paid for this booking" });
      return;
    }
    const amount = (amountUsd ?? DEFAULT_DEPOSIT_USD).toFixed(2);
    const token = await getAccessToken();
    const r = await fetch(`${getApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: `booking-${bookingId}`,
            description: `Refundable test-drive deposit — ${booking.carTitle || "Booking #" + bookingId}`,
            custom_id: String(bookingId),
            amount: { currency_code: "USD", value: amount },
          },
        ],
        application_context: {
          brand_name: "AutoElite Motors",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      req.log.error({ j }, "PayPal create-order failed");
      res.status(502).json({ error: "PayPal create-order failed", details: j });
      return;
    }
    await db
      .update(bookingsTable)
      .set({
        paypalOrderId: j.id,
        depositAmount: amount,
        depositCurrency: "USD",
        paymentStatus: "pending",
      })
      .where(eq(bookingsTable.id, bookingId));
    res.json({ orderId: j.id, amount, currency: "USD" });
  } catch (err: any) {
    req.log.error({ err }, "Error creating PayPal order");
    res.status(500).json({ error: err?.message || "Failed to create order" });
  }
});

const CaptureBody = z.object({ orderId: z.string(), bookingId: z.number().int().positive() });

router.post("/paypal/capture-order", async (req: Request, res: Response) => {
  if (!isPayPalConfigured()) {
    res.status(503).json({ error: "PayPal is not configured" });
    return;
  }
  const parsed = CaptureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  try {
    const { orderId, bookingId } = parsed.data;
    const token = await getAccessToken();
    const r = await fetch(`${getApiBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const j = await r.json();
    if (!r.ok || j.status !== "COMPLETED") {
      req.log.error({ j }, "PayPal capture failed");
      await db
        .update(bookingsTable)
        .set({ paymentStatus: "failed" })
        .where(eq(bookingsTable.id, bookingId));
      res.status(502).json({ error: "Payment capture failed", details: j });
      return;
    }
    const captureId = j?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
    await db
      .update(bookingsTable)
      .set({
        paymentStatus: "paid",
        paypalCaptureId: captureId,
        paymentCompletedAt: new Date(),
        status: "confirmed",
      })
      .where(eq(bookingsTable.id, bookingId));
    res.json({ success: true, captureId, status: "paid" });
  } catch (err: any) {
    req.log.error({ err }, "Error capturing PayPal order");
    res.status(500).json({ error: err?.message || "Capture failed" });
  }
});

router.post("/paypal/cancel-order", async (req, res) => {
  const parsed = z.object({ bookingId: z.number().int().positive() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  await db
    .update(bookingsTable)
    .set({ paymentStatus: "cancelled" })
    .where(eq(bookingsTable.id, parsed.data.bookingId));
  res.json({ success: true });
});

// Admin: refund a paid deposit (after the test-drive meetup)
const ADMIN_TOKEN_PREFIX = "Bearer ";
async function requireAdminLite(req: any, res: any, next: any) {
  const auth: string | undefined = req.headers?.authorization;
  if (!auth || !auth.startsWith(ADMIN_TOKEN_PREFIX)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const raw = Buffer.from(auth.slice(ADMIN_TOKEN_PREFIX.length), "base64").toString("utf8");
    const obj = JSON.parse(raw);
    if (!obj?.userId) return res.status(401).json({ error: "Unauthorized" });
    req.adminId = obj.userId;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

router.post("/admin/paypal/refund/:bookingId", requireAdminLite, async (req, res) => {
  if (!isPayPalConfigured()) {
    res.status(503).json({ error: "PayPal is not configured" });
    return;
  }
  try {
    const bookingId = Number(req.params.bookingId);
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId)).limit(1);
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (booking.paymentStatus !== "paid" || !booking.paypalCaptureId) {
      res.status(400).json({ error: "No paid deposit to refund" });
      return;
    }
    if (booking.paymentStatus === "refunded") {
      res.status(400).json({ error: "Already refunded" });
      return;
    }
    const token = await getAccessToken();
    const r = await fetch(
      `${getApiBase()}/v2/payments/captures/${booking.paypalCaptureId}/refund`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          note_to_payer: "Refund issued after test-drive meetup — AutoElite Motors",
        }),
      },
    );
    const j = await r.json();
    if (!r.ok) {
      (req as any).log?.error({ j }, "PayPal refund failed");
      res.status(502).json({ error: "Refund failed", details: j });
      return;
    }
    await db
      .update(bookingsTable)
      .set({
        paymentStatus: "refunded",
        paypalRefundId: j.id,
        refundedAt: new Date(),
      })
      .where(eq(bookingsTable.id, bookingId));
    res.json({ success: true, refundId: j.id });
  } catch (err: any) {
    (req as any).log?.error({ err }, "Error refunding");
    res.status(500).json({ error: err?.message || "Refund failed" });
  }
});

export default router;
