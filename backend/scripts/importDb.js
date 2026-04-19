/**
 * Restores a .bak file into the configured database, replacing whatever
 * is there. Use this on a teammate's machine to clone the DB exactly.
 *
 * Usage (from backend/ folder):
 *   node scripts/importDb.js <path-to-bak-file>
 *
 * Examples:
 *   node scripts/importDb.js OnlineClothingBrand_20260420-1530.bak
 *   node scripts/importDb.js "C:\Downloads\OnlineClothingBrand.bak"
 *
 * If you give just a filename, the script looks for it in the project's
 * `database/backup/` folder.
 *
 * WARNING: This DROPS all current data in the target database and
 * replaces it with what's in the .bak file. There is a confirmation
 * prompt before anything destructive happens.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { getPool, sql } = require("../src/config/db");
const env = require("../src/config/env");

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function resolveBakPath(arg) {
  if (path.isAbsolute(arg) && fs.existsSync(arg)) return arg;
  if (fs.existsSync(arg)) return path.resolve(arg);
  const inBackupDir = path.resolve(__dirname, "../../database/backup", arg);
  if (fs.existsSync(inBackupDir)) return inBackupDir;
  return null;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error(
      "Usage: node scripts/importDb.js <path-to-bak-file>\n\n" +
        "Drop the .bak your teammate sent into database/backup/\n" +
        "and pass just the filename."
    );
    process.exit(1);
    return;
  }

  const bakPath = resolveBakPath(arg);
  if (!bakPath) {
    console.error(
      `Could not find backup file: ${arg}\n` +
        `Looked in:\n` +
        `  - the absolute path you gave\n` +
        `  - the current working directory\n` +
        `  - <project_root>/database/backup/`
    );
    process.exit(1);
    return;
  }

  console.log(`\nAbout to restore "${env.dbName}" from:\n  ${bakPath}`);
  console.log(`Server: ${env.dbServer}\n`);
  console.log(
    "This will OVERWRITE all current data in the target database.\n"
  );

  const answer = await ask(`Type "yes" to proceed: `);
  if (answer.toLowerCase() !== "yes") {
    console.log("Aborted. No changes made.");
    process.exit(0);
    return;
  }

  // We must connect to master to restore, since the target DB will be in single-user mode.
  // Easiest portable approach: switch the existing pool to issue commands against master.
  try {
    const pool = await getPool();

    console.log("\nReading file list from backup...");
    const fileList = await pool
      .request()
      .input("path", sql.NVarChar, bakPath)
      .query(`RESTORE FILELISTONLY FROM DISK = @path`);

    const dataLogical = fileList.recordset.find((r) => r.Type === "D");
    const logLogical = fileList.recordset.find((r) => r.Type === "L");
    if (!dataLogical || !logLogical) {
      throw new Error("Backup is missing data or log file metadata.");
    }

    console.log("Switching target DB to single-user mode...");
    await pool.request().query(`
      IF DB_ID('${env.dbName}') IS NOT NULL
      BEGIN
        ALTER DATABASE [${env.dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
      END
    `);

    console.log("Restoring database (this can take a minute)...");
    await pool
      .request()
      .input("path", sql.NVarChar, bakPath)
      .query(`
        RESTORE DATABASE [${env.dbName}]
        FROM DISK = @path
        WITH REPLACE, RECOVERY, STATS = 10
      `);

    console.log("Switching DB back to multi-user mode...");
    await pool.request().query(`
      ALTER DATABASE [${env.dbName}] SET MULTI_USER;
    `);

    console.log("\nRestore complete. Your DB now matches the source.\n");
    console.log("Verify with:  node scripts/listAdmins.js");
    process.exit(0);
  } catch (err) {
    console.error("\nRestore failed:", err.message || err);
    if (
      String(err.message || "").match(/cannot open backup|access is denied/i)
    ) {
      console.error(`
Hint: SQL Server can't read the .bak file at ${bakPath}.
Move it to a folder readable by the SQL Server service account, e.g.:
  C:\\ProgramData\\Microsoft\\SQL Server\\Backups\\
…and re-run this script with the new path.
`);
    }
    process.exit(1);
  }
}

main();
