import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";

export async function createNotification(opts: {
  type: string;
  title: string;
  message: string;
  link?: string;
  priority?: "low" | "normal" | "high" | "urgent";
}) {
  try {
    await db.insert(notificationsTable).values({
      type: opts.type,
      title: opts.title,
      message: opts.message,
      link: opts.link,
      priority: opts.priority || "normal",
    });
  } catch {}
}
