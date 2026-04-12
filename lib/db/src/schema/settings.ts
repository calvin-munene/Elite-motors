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
  country: text("country").default("Kenya"),
  googleMapsUrl: text("google_maps_url"),
  googleMapsEmbedUrl: text("google_maps_embed_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  youtubeUrl: text("youtube_url"),
  openingHours: text("opening_hours"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  heroImage: text("hero_image"),
  aboutTitle: text("about_title"),
  aboutContent: text("about_content"),
  aboutImage: text("about_image"),
  yearsInBusiness: integer("years_in_business"),
  carsInStock: integer("cars_in_stock"),
  satisfiedClients: integer("satisfied_clients"),
  currency: text("currency").default("KES"),
  usdToKesRate: integer("usd_to_kes_rate").default(130),
  inventoryTitle: text("inventory_title"),
  inventorySubtitle: text("inventory_subtitle"),
  servicesTitle: text("services_title"),
  servicesSubtitle: text("services_subtitle"),
  contactTitle: text("contact_title"),
  contactSubtitle: text("contact_subtitle"),
  footerTagline: text("footer_tagline"),
  whatsappApiEnabled: text("whatsapp_api_enabled").default("false"),
  whatsappApiToken: text("whatsapp_api_token"),
  metaDescription: text("meta_description"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").default("#DC2626"),
  categoryImages: text("category_images"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettingsTable.$inferSelect;
