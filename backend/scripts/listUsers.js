/**
 * Lists every customer account (no passwords).
 *
 * Usage (from backend/ folder):
 *   node scripts/listUsers.js
 */

const { getPool } = require("../src/config/db");

async function main() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT user_id, username, email, full_name
      FROM Users
      ORDER BY user_id
    `);

    if (result.recordset.length === 0) {
      console.log("\nNo user accounts found in the Users table.");
    } else {
      console.log(`\nFound ${result.recordset.length} user account(s):\n`);
      console.table(result.recordset);
    }
    process.exit(0);
  } catch (err) {
    console.error("Failed to list users:", err.message || err);
    process.exit(1);
  }
}

main();
