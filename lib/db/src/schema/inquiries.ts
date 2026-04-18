import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  carId: integer("car_id"),
  carTitle: text("car_title"),
  message: text("message").notNull(),
  type: text("type").notNull().default("general"),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  assignedAdminId: integer("assigned_admin_id"),
  leadScore: integer("lead_score").default(50),
  leadLevel: text("lead_level").default("warm"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({ id: true, createdAt: true });
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
