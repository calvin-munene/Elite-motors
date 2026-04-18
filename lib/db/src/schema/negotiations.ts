import { pgTable, text, serial, integer, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";

export const negotiationsTable = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  carId: integer("car_id").notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  startingPrice: numeric("starting_price", { precision: 12, scale: 2 }).notNull(),
  finalOffer: numeric("final_offer", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("active"),
  messages: jsonb("messages").$type<Array<{ role: "user" | "assistant"; content: string; offer?: number }>>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Negotiation = typeof negotiationsTable.$inferSelect;
