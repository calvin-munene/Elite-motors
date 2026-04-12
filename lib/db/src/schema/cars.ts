import { pgTable, text, serial, integer, boolean, numeric, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const carsTable = pgTable("cars", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  year: integer("year").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  discountedPrice: numeric("discounted_price", { precision: 12, scale: 2 }),
  mileage: integer("mileage").notNull(),
  engineSize: text("engine_size"),
  transmission: text("transmission").notNull(),
  fuelType: text("fuel_type").notNull(),
  drivetrain: text("drivetrain"),
  bodyType: text("body_type").notNull(),
  seats: integer("seats"),
  doors: integer("doors"),
  color: text("color").notNull(),
  stockNumber: text("stock_number"),
  vin: text("vin"),
  condition: text("condition").notNull().default("used"),
  availability: text("availability").notNull().default("available"),
  shortDescription: text("short_description"),
  description: text("description"),
  features: jsonb("features").$type<string[]>(),
  safetyFeatures: jsonb("safety_features").$type<string[]>(),
  comfortFeatures: jsonb("comfort_features").$type<string[]>(),
  techFeatures: jsonb("tech_features").$type<string[]>(),
  gallery: jsonb("gallery").$type<string[]>(),
  videoUrl: text("video_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  financingAvailable: boolean("financing_available").notNull().default(true),
  location: text("location"),
  category: text("category"),
  // Japanese Import Fields
  isJapaneseImport: boolean("is_japanese_import").notNull().default(false),
  auctionGrade: text("auction_grade"),
  chassisNumber: text("chassis_number"),
  shippingStatus: text("shipping_status").default("in_stock"),
  japanDepartureDate: text("japan_departure_date"),
  kenyaArrivalDate: text("kenya_arrival_date"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCarSchema = createInsertSchema(carsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof carsTable.$inferSelect;
