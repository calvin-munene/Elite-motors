import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  dealerName: text("dealer_name").notNull().default("AutoElite Motors"),
  tagline: text("tagline"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  googleMapsUrl: text("google_maps_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  youtubeUrl: text("youtube_url"),
  openingHours: text("opening_hours"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  aboutTitle: text("about_title"),
  aboutContent: text("about_content"),
  aboutImage: text("about_image"),
  yearsInBusiness: integer("years_in_business"),
  carsInStock: integer("cars_in_stock"),
  satisfiedClients: integer("satisfied_clients"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettingsTable.$inferSelect;
