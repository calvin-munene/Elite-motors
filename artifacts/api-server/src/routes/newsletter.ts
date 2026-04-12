import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required" });
    }

    const normalized = email.trim().toLowerCase();

    // Check if already subscribed
    const existing = await db
      .select()
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.email, normalized))
      .limit(1);

    if (existing[0]) {
      return res.status(200).json({ message: "already_subscribed" });
    }

    await db.insert(newsletterSubscribersTable).values({
      email: normalized,
      status: "active",
    });

    res.status(201).json({ message: "subscribed" });
  } catch (err) {
    req.log.error({ err }, "Error subscribing to newsletter");
    res.status(500).json({ error: "Failed to subscribe. Please try again." });
  }
});

// Admin: list all subscribers
router.get("/newsletter/subscribers", async (req, res) => {
  try {
    const subscribers = await db
      .select()
      .from(newsletterSubscribersTable)
      .orderBy(desc(newsletterSubscribersTable.subscribedAt));
    res.json(subscribers);
  } catch (err) {
    req.log.error({ err }, "Error fetching subscribers");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
