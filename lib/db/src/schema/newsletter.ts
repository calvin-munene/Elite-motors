import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
});

export type NewsletterSubscriber = typeof newsletterSubscribersTable.$inferSelect;
