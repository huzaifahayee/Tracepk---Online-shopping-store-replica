/**
 * Resets an existing admin's password to a value you choose.
 *
 * Usage (from backend/ folder):
 *   node scripts/resetAdminPassword.js <email> <newPassword>
 *
 * Example:
 *   node scripts/resetAdminPassword.js admin@trace.pk MyNewPass123!
 */

const bcrypt = require("bcryptjs");
const { getPool, sql } = require("../src/config/db");

async function main() {
  const [, , emailArg, password] = process.argv;

  if (!emailArg || !password) {
    console.error(`
Usage:
  node scripts/resetAdminPassword.js <email> <newPassword>

Example:
  node scripts/resetAdminPassword.js admin@trace.pk MyNewPass123!
`);
    process.exit(1);
    return;
  }

  const email = emailArg.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 10);

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar(100), email)
      .input("password_hash", sql.VarChar(255), hash)
      .query(`
        UPDATE Admins
        SET password_hash = @password_hash
        WHERE LOWER(email) = @email
      `);

    if (result.rowsAffected[0] === 0) {
      console.error(
        `\nNo admin found with email: ${email}\n` +
          "Run `node scripts/listAdmins.js` to see existing admin emails."
      );
      process.exit(1);
    }

    console.log(`\nPassword reset for admin <${email}>.`);
    console.log("You can now log in at /admin/login with the new password.");
    process.exit(0);
  } catch (err) {
    console.error("Reset failed:", err.message || err);
    process.exit(1);
  }
}

main();
