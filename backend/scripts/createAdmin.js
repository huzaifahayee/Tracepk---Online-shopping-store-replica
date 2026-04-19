/**
 * Creates an admin row with a bcrypt password hash.
 *
 * Usage (from backend/ folder):
 *   node scripts/createAdmin.js <username> <email> <password> "<full_name>"
 *
 * Example:
 *   node scripts/createAdmin.js trace_admin ops@yourstore.com "SecurePass123!" "Operations Lead"
 */

const bcrypt = require("bcryptjs");
const { getPool, sql } = require("../src/config/db");

async function main() {
  const [, , username, email, password, fullName] = process.argv;

  if (!username || !email || !password || !fullName) {
    console.error(`
Usage:
  node scripts/createAdmin.js <username> <email> <password> "<full_name>"

Example:
  node scripts/createAdmin.js trace_admin admin@mystore.com mySecretPass "Site Admin"
`);
    process.exit(1);
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("username", sql.VarChar(50), username.trim())
      .input("password_hash", sql.VarChar(255), hash)
      .input("full_name", sql.VarChar(100), fullName.trim())
      .input("email", sql.VarChar(100), email.trim().toLowerCase())
      .query(`
        INSERT INTO Admins (username, password_hash, full_name, email)
        VALUES (@username, @password_hash, @full_name, @email)
      `);

    console.log(`Admin created. Log in at /admin/login with email: ${email.trim()}`);
    process.exit(0);
  } catch (err) {
    if (String(err.message || "").includes("UNIQUE")) {
      console.error("Failed: username or email already exists.");
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

main();
