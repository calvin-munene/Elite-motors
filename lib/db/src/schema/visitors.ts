import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const visitorSessionsTable = pgTable("visitor_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  country: text("country"),
  city: text("city"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  pageViews: integer("page_views").notNull().default(0),
  totalDurationSeconds: integer("total_duration_seconds").notNull().default(0),
  firstSeen: timestamp("first_seen").notNull().defaultNow(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
});

export const pageViewsTable = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  path: text("path").notNull(),
  title: text("title"),
  referrer: text("referrer"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

export const carViewsTable = pgTable("car_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  carId: integer("car_id").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

export type VisitorSession = typeof visitorSessionsTable.$inferSelect;
export type PageView = typeof pageViewsTable.$inferSelect;
export type CarView = typeof carViewsTable.$inferSelect;
