import { pgTable, text, serial, integer, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tradeInsTable = pgTable("trade_ins", {
  id: serial("id").primaryKey(),
  ownerName: text("owner_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  condition: text("condition").notNull(),
  askingPrice: numeric("asking_price", { precision: 12, scale: 2 }),
  notes: text("notes"),
  photos: jsonb("photos").$type<string[]>(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTradeInSchema = createInsertSchema(tradeInsTable).omit({ id: true, createdAt: true });
export type InsertTradeIn = z.infer<typeof insertTradeInSchema>;
export type TradeIn = typeof tradeInsTable.$inferSelect;
