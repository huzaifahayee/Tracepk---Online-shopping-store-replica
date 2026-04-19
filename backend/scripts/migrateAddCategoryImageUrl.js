/**
 * Idempotent migration: ensures the Categories table has an `image_url` column.
 *
 * Safe to run multiple times. No-op if the column already exists.
 *
 * Usage (from backend/ folder):
 *   node scripts/migrateAddCategoryImageUrl.js
 */

const { getPool } = require("../src/config/db");

async function main() {
  try {
    const pool = await getPool();
    const check = await pool.request().query(`
      SELECT COUNT(*) AS cnt
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'image_url'
    `);

    if (check.recordset[0].cnt > 0) {
      console.log("Categories.image_url already exists — nothing to do.");
      process.exit(0);
    }

    await pool.request().query(`
      ALTER TABLE Categories
      ADD image_url VARCHAR(255) NULL
    `);
    console.log("Added Categories.image_url (VARCHAR(255) NULL).");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message || err);
    process.exit(1);
  }
}

main();
