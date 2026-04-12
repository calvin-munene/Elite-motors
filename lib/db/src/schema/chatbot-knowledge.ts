import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chatbotKnowledgeTable = pgTable("chatbot_knowledge", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  keywords: text("keywords").notNull().default("[]"),
  source: text("source").notNull().default("openai"),
  hitCount: integer("hit_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertChatbotKnowledgeSchema = createInsertSchema(chatbotKnowledgeTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChatbotKnowledge = z.infer<typeof insertChatbotKnowledgeSchema>;
export type ChatbotKnowledge = typeof chatbotKnowledgeTable.$inferSelect;
