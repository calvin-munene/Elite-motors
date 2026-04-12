import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const financingInquiriesTable = pgTable("financing_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  carId: integer("car_id"),
  carTitle: text("car_title"),
  loanAmount: numeric("loan_amount", { precision: 12, scale: 2 }),
  downPayment: numeric("down_payment", { precision: 12, scale: 2 }),
  loanTermMonths: integer("loan_term_months"),
  employmentStatus: text("employment_status"),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFinancingInquirySchema = createInsertSchema(financingInquiriesTable).omit({ id: true, createdAt: true });
export type InsertFinancingInquiry = z.infer<typeof insertFinancingInquirySchema>;
export type FinancingInquiry = typeof financingInquiriesTable.$inferSelect;
