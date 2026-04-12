import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq, desc, ilike, sql, and } from "drizzle-orm";

const router = Router();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function formatPost(p: typeof blogPostsTable.$inferSelect) {
  return {
    ...p,
    createdAt: p.createdAt.toISOString(),
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
  };
}

router.get("/blog", async (req, res) => {
  try {
    const { category, published, limit = "10", offset = "0" } = req.query as Record<string, string>;
    const conditions = [];
    if (category) conditions.push(eq(blogPostsTable.category, category));
    if (published === "true") conditions.push(eq(blogPostsTable.isPublished, true));
    if (published === "false") conditions.push(eq(blogPostsTable.isPublished, false));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [posts, countResult] = await Promise.all([
      db.select().from(blogPostsTable).where(whereClause).orderBy(desc(blogPostsTable.createdAt)).limit(parseInt(limit)).offset(parseInt(offset)),
      db.select({ count: sql<number>`count(*)` }).from(blogPostsTable).where(whereClause),
    ]);
    res.json({ posts: posts.map(formatPost), total: Number(countResult[0]?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Error listing blog posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/blog", async (req, res) => {
  try {
    const body = req.body;
    const slug = body.slug || slugify(body.title);
    const result = await db.insert(blogPostsTable).values({
      ...body,
      slug,
      publishedAt: body.isPublished ? new Date() : null,
    }).returning();
    res.status(201).json(formatPost(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error creating blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/blog/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const result = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatPost(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error getting blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/blog/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const result = await db.update(blogPostsTable).set({
      ...body,
      publishedAt: body.isPublished ? new Date() : null,
    }).where(eq(blogPostsTable.id, id)).returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatPost(result[0]));
  } catch (err) {
    req.log.error({ err }, "Error updating blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/blog/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
