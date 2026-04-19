const app = require("./app");
const env = require("./config/env");
const { getPool } = require("./config/db");

async function start() {
  try {
    await getPool();
    // eslint-disable-next-line no-console
    console.log("Connected to MSSQL");

    // Run schema migrations (idempotent)
    const runMigrations = require("./utils/migrate");
    await runMigrations();

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();

