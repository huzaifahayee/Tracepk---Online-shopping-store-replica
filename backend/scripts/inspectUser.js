/**
 * Show every non-secret column for one user (matches by email, case-insensitive).
 *
 * Usage (from backend/ folder):
 *   node scripts/inspectUser.js <email>
 */

const { getPool, sql } = require("../src/config/db");

async function main() {
  const [, , emailArg] = process.argv;
  if (!emailArg) {
    console.error("Usage: node scripts/inspectUser.js <email>");
    process.exit(1);
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar(100), emailArg.trim().toLowerCase())
      .query(`
        SELECT user_id, username, email, full_name, phone_number, address,
               LEN(password_hash) AS password_hash_length
        FROM Users
        WHERE LOWER(email) = @email
      `);

    if (result.recordset.length === 0) {
      console.log(`No user found with email: ${emailArg}`);
    } else {
      console.log(`\nDB row for ${emailArg}:\n`);
      console.table(result.recordset);
    }
    process.exit(0);
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
