import { Router } from "express";
import { db } from "@workspace/db";
import { adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin, requireRole, hashPassword, getClientIp, logAudit } from "../middlewares/auth";

const router = Router();

router.get("/admin/users", requireAdmin, requireRole("owner", "manager"), async (req, res) => {
  try {
    const users = await db.select({
      id: adminUsersTable.id,
      username: adminUsersTable.username,
      name: adminUsersTable.name,
      email: adminUsersTable.email,
      role: adminUsersTable.role,
      isActive: adminUsersTable.isActive,
      lastLoginAt: adminUsersTable.lastLoginAt,
      createdAt: adminUsersTable.createdAt,
    }).from(adminUsersTable);
    res.json({
      users: users.map(u => ({
        ...u,
        lastLoginAt: u.lastLoginAt?.toISOString() || null,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/users", requireAdmin, requireRole("owner"), async (req: any, res) => {
  try {
    const { username, password, name, email, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    if (!["owner", "manager", "sales"].includes(role)) return res.status(400).json({ error: "Invalid role" });

    const existing = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));
    if (existing[0]) return res.status(409).json({ error: "Username already exists" });

    const [created] = await db.insert(adminUsersTable).values({
      username,
      passwordHash: hashPassword(password),
      name: name || null,
      email: email || null,
      role,
    }).returning();

    await logAudit({
      adminId: req.adminUserId, adminUsername: req.adminUsername,
      action: "create", entity: "admin_user", entityId: created.id,
      changes: { username, role, name, email },
      ipAddress: getClientIp(req), userAgent: req.headers["user-agent"],
    });

    res.json({ id: created.id, username: created.username, role: created.role });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:id", requireAdmin, requireRole("owner"), async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, role, isActive, password } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined && ["owner", "manager", "sales"].includes(role)) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive ? "true" : "false";
    if (password) updates.passwordHash = hashPassword(password);

    await db.update(adminUsersTable).set(updates).where(eq(adminUsersTable.id, id));
    await logAudit({
      adminId: req.adminUserId, adminUsername: req.adminUsername,
      action: "update", entity: "admin_user", entityId: id, changes: { ...updates, passwordHash: password ? "[redacted]" : undefined },
      ipAddress: getClientIp(req), userAgent: req.headers["user-agent"],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/users/:id", requireAdmin, requireRole("owner"), async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    if (id === req.adminUserId) return res.status(400).json({ error: "Cannot delete yourself" });
    await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
    await logAudit({
      adminId: req.adminUserId, adminUsername: req.adminUsername,
      action: "delete", entity: "admin_user", entityId: id,
      ipAddress: getClientIp(req), userAgent: req.headers["user-agent"],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
