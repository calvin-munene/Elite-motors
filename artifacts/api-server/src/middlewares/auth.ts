import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { adminUsersTable, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SESSION_SECRET = process.env.SESSION_SECRET || "dealership-secret-key-2024";

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(password).digest("hex");
}

export function generateToken(userId: number, username: string): string {
  const payload = JSON.stringify({ userId, username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + signature;
}

export function verifyToken(token: string): { userId: number; username: string } | null {
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

export interface AuthedRequest extends Request {
  adminUserId: number;
  adminUsername: string;
  adminRole: string;
}

export async function requireAdmin(req: any, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = auth.slice(7);
  const data = verifyToken(token);
  if (!data) return res.status(401).json({ error: "Invalid or expired token" });

  try {
    const users = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, data.userId));
    const user = users[0];
    if (!user || user.isActive !== "true") return res.status(401).json({ error: "Account inactive" });
    req.adminUserId = data.userId;
    req.adminUsername = data.username;
    req.adminRole = user.role || "owner";
    next();
  } catch {
    return res.status(500).json({ error: "Auth check failed" });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.adminRole) return res.status(401).json({ error: "Unauthorized" });
    if (!allowedRoles.includes(req.adminRole) && req.adminRole !== "owner") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

export async function logAudit(opts: {
  adminId?: number;
  adminUsername?: string;
  action: string;
  entity: string;
  entityId?: string | number;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.insert(auditLogsTable).values({
      adminId: opts.adminId,
      adminUsername: opts.adminUsername,
      action: opts.action,
      entity: opts.entity,
      entityId: opts.entityId != null ? String(opts.entityId) : undefined,
      changes: opts.changes,
      ipAddress: opts.ipAddress,
      userAgent: opts.userAgent,
    });
  } catch (e) {
    // do not fail the request if audit logging fails
  }
}
