/**
 * Lists every admin account (no passwords — just usernames + emails).
 *
 * Usage (from backend/ folder):
 *   node scripts/listAdmins.js
 */

const { getPool } = require("../src/config/db");

async function main() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT admin_id, username, email, full_name
      FROM Admins
      ORDER BY admin_id
    `);

    if (result.recordset.length === 0) {
      console.log("\nNo admin accounts found in the Admins table.");
      console.log(
        'Create one with:\n  node scripts/createAdmin.js <username> <email> <password> "<full_name>"'
      );
    } else {
      console.log(`\nFound ${result.recordset.length} admin account(s):\n`);
      console.table(result.recordset);
      console.log("\nLog in at /admin/login using the EMAIL above + your password.");
      console.log(
        "If you don't remember the password, reset it with:\n" +
          "  node scripts/resetAdminPassword.js <email> <newPassword>"
      );
    }
    process.exit(0);
  } catch (err) {
    console.error("Failed to list admins:", err.message || err);
    process.exit(1);
  }
}

main();
