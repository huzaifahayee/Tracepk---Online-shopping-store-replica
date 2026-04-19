/**
 * Exports a full backup of the configured database to a .bak file.
 *
 * Usage (from backend/ folder):
 *   node scripts/exportDb.js
 *
 * Optional custom path:
 *   node scripts/exportDb.js D:\backups\my.bak
 *
 * The default output path is:
 *   <project_root>/database/backup/<DB_NAME>_<timestamp>.bak
 *
 * IMPORTANT: SQL Server itself writes the .bak file (not Node), so the
 * destination directory must be writable by the SQL Server service account.
 * If you hit "Cannot open backup device" or "Access is denied", either:
 *   1. Use a path under SQL Server's default backup folder, OR
 *   2. Grant the SQL Server service account write access to the target folder.
 */

const fs = require("fs");
const path = require("path");
const { getPool, sql } = require("../src/config/db");
const env = require("../src/config/env");

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

async function main() {
  const customPath = process.argv[2];
  const defaultDir = path.resolve(__dirname, "../../database/backup");
  const defaultFile = path.join(
    defaultDir,
    `${env.dbName}_${timestamp()}.bak`
  );
  const target = customPath
    ? path.resolve(customPath)
    : defaultFile;

  if (!customPath) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }

  console.log(`Backing up database "${env.dbName}" to:\n  ${target}\n`);

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("path", sql.NVarChar, target)
      .query(`
        BACKUP DATABASE [${env.dbName}]
        TO DISK = @path
        WITH FORMAT, INIT,
             NAME = N'${env.dbName} full backup',
             STATS = 10
      `);

    console.log("\nBackup complete.");
    console.log(`Send the file to your teammate, e.g. via WhatsApp/Drive:`);
    console.log(`  ${target}`);
    console.log(`\nThey restore it with:`);
    console.log(`  node scripts/importDb.js "${path.basename(target)}"`);
    process.exit(0);
  } catch (err) {
    console.error("\nBackup failed:", err.message || err);
    if (String(err.message || "").match(/cannot open backup|access is denied/i)) {
      console.error(`
Hint: SQL Server can't write to "${target}".
Try one of:
  1. node scripts/exportDb.js "C:\\Temp\\${env.dbName}.bak"
     (then move the file out of C:\\Temp afterwards)
  2. Grant the SQL Server service account WRITE permission on the
     target folder via Right-click → Properties → Security.
`);
    }
    process.exit(1);
  }
}

main();
