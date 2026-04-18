import { Router } from "express";
import { db } from "@workspace/db";
import { adminUsersTable, inquiriesTable, bookingsTable, carsTable, tradeInsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

const SESSION_SECRET = process.env.SESSION_SECRET || "dealership-secret-key-2024";

// Fixed salt for password hashing — intentionally separate from SESSION_SECRET
// so that rotating the session secret never breaks existing passwords.
const PASSWORD_SALT = "autoelite-motors-password-salt-v1";

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", PASSWORD_SALT).update(password).digest("hex");
}

function generateToken(userId: number, username: string): string {
  const payload = JSON.stringify({ userId, username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + signature;
}

function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    const [payloadB64, sig] = token.split(".");
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

async function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = auth.slice(7);
  const data = verifyToken(token);
  if (!data) return res.status(401).json({ error: "Invalid or expired token" });
  req.adminUserId = data.userId;
  req.adminUsername = data.username;
  next();
}

// Ensure default admin exists and its password hash is up-to-date.
// The hash previously used SESSION_SECRET as the HMAC key, which made it
// environment-dependent. We now use a fixed salt, so we resync on boot
// to heal any stale hash left by the seed script or a prior SECRET value.
async function ensureDefaultAdmin() {
  try {
    const existing = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.username, "admin"))
      .limit(1);

    const correctHash = hashPassword("admin123");

    if (!existing[0]) {
      await db.insert(adminUsersTable).values({
        username: "admin",
        passwordHash: correctHash,
        name: "Administrator",
      });
    } else if (existing[0].passwordHash !== correctHash) {
      // Resync hash (fixes stale hash from old SESSION_SECRET-based approach)
      await db
        .update(adminUsersTable)
        .set({ passwordHash: correctHash })
        .where(eq(adminUsersTable.username, "admin"));
    }
  } catch {}
}

ensureDefaultAdmin();

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    const users = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));
    if (!users[0]) return res.status(401).json({ error: "Invalid credentials" });

    const hash = hashPassword(password);
    if (hash !== users[0].passwordHash) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(users[0].id, users[0].username);
    res.json({
      token,
      admin: { id: users[0].id, username: users[0].username, name: users[0].name },
    });
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/me", requireAdmin, async (req: any, res) => {
  try {
    const users = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, req.adminUserId));
    if (!users[0]) return res.status(404).json({ error: "Admin not found" });
    res.json({ id: users[0].id, username: users[0].username, name: users[0].name });
  } catch (err) {
    req.log.error({ err }, "Error getting admin me");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/dashboard", requireAdmin, async (req: any, res) => {
  try {
    const [
      totalCars, availableCars, soldCars,
      totalInquiries, newInquiries,
      totalBookings, pendingBookings,
      totalTradeIns,
      recentInquiries, recentBookings,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(carsTable),
      db.select({ count: sql<number>`count(*)` }).from(carsTable).where(eq(carsTable.availability, "available")),
      db.select({ count: sql<number>`count(*)` }).from(carsTable).where(eq(carsTable.availability, "sold")),
      db.select({ count: sql<number>`count(*)` }).from(inquiriesTable),
      db.select({ count: sql<number>`count(*)` }).from(inquiriesTable).where(eq(inquiriesTable.status, "new")),
      db.select({ count: sql<number>`count(*)` }).from(bookingsTable),
      db.select({ count: sql<number>`count(*)` }).from(bookingsTable).where(eq(bookingsTable.status, "pending")),
      db.select({ count: sql<number>`count(*)` }).from(tradeInsTable),
      db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt)).limit(5),
      db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt)).limit(5),
    ]);

    res.json({
      totalCars: Number(totalCars[0]?.count ?? 0),
      availableCars: Number(availableCars[0]?.count ?? 0),
      soldCars: Number(soldCars[0]?.count ?? 0),
      totalInquiries: Number(totalInquiries[0]?.count ?? 0),
      newInquiries: Number(newInquiries[0]?.count ?? 0),
      totalBookings: Number(totalBookings[0]?.count ?? 0),
      pendingBookings: Number(pendingBookings[0]?.count ?? 0),
      totalTradeIns: Number(totalTradeIns[0]?.count ?? 0),
      recentInquiries: recentInquiries.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })),
      recentBookings: recentBookings.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
