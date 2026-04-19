/**
 * Auto-migration: ensures the is_disabled column exists on the Users table.
 * Run once at server startup — safe to call repeatedly (idempotent).
 */
const { getPool } = require("../config/db");

async function runMigrations() {
  try {
    const pool = await getPool();
    await pool.request().query(`
      IF COL_LENGTH('Users', 'is_disabled') IS NULL
      BEGIN
        ALTER TABLE Users ADD is_disabled BIT NOT NULL DEFAULT 0;
      END
    `);
    // eslint-disable-next-line no-console
    console.log("Migrations checked / applied.");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Migration error (non-fatal):", error.message);
  }
}

module.exports = runMigrations;
