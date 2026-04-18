#!/usr/bin/env node
/**
 * Seeds the database from /scripts/seed.sql, but ONLY if it's empty.
 *
 * Designed to run during deployment (after `db:push`) so a fresh host
 * (Render, Railway, Fly, etc.) automatically gets the same content as
 * the live demo. On subsequent deploys, when the cars table already
 * has data, this is a no-op — it never destroys real data.
 *
 * Lives inside lib/db/ so Node can resolve the `pg` package via the
 * @workspace/db package's node_modules.
 *
 * Usage (from repo root): pnpm db:seed-if-empty
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[seed-if-empty] DATABASE_URL is not set; skipping.");
  process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// lib/db/ → ../../scripts/seed.sql (repo root)
const SEED_PATH = path.resolve(__dirname, "..", "..", "scripts", "seed.sql");

if (!fs.existsSync(SEED_PATH)) {
  console.error(`[seed-if-empty] seed.sql not found at ${SEED_PATH}; skipping.`);
  process.exit(0);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function tableHasRows(client, tableName) {
  try {
    const r = await client.query(`SELECT COUNT(*)::int AS c FROM ${tableName}`);
    return Number(r.rows[0]?.c ?? 0) > 0;
  } catch {
    return false; // table likely doesn't exist yet
  }
}

(async () => {
  const client = await pool.connect();
  try {
    if (await tableHasRows(client, "cars")) {
      console.log(
        "[seed-if-empty] cars table already populated; skipping seed (no data destroyed).",
      );
      return;
    }

    console.log(
      "[seed-if-empty] Empty database detected — running scripts/seed.sql ...",
    );
    const sqlText = fs.readFileSync(SEED_PATH, "utf8");
    // pg's query() handles multi-statement SQL when no params are passed.
    await client.query(sqlText);
    console.log(
      "[seed-if-empty] Seed complete — site is now populated with demo content.",
    );
  } catch (err) {
    // Never fail the deploy because of seeding — log loudly instead.
    console.error(
      "[seed-if-empty] Seeding failed (deploy will continue):",
      err && err.message ? err.message : err,
    );
  } finally {
    client.release();
    await pool.end();
  }
})();
