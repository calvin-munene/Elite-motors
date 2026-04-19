import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  carId: integer("car_id"),
  carTitle: text("car_title"),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  location: text("location"),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  assignedAdminId: integer("assigned_admin_id"),
  leadScore: integer("lead_score").default(50),
  leadLevel: text("lead_level").default("warm"),
  // Refundable deposit (PayPal)
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }),
  depositCurrency: text("deposit_currency").default("USD"),
  paymentStatus: text("payment_status").notNull().default("none"), // none | pending | paid | refunded | failed | cancelled
  paypalOrderId: text("paypal_order_id"),
  paypalCaptureId: text("paypal_capture_id"),
  paypalRefundId: text("paypal_refund_id"),
  paymentCompletedAt: timestamp("payment_completed_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
