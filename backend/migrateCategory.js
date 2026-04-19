const { sql, getPool } = require('./src/config/db');

async function migrate() {
  try {
    const pool = await getPool();
    await pool.request().query("ALTER TABLE Categories ADD image_url VARCHAR(255);");
    console.log("Migration successful: Added image_url to Categories.");
  } catch (error) {
    if (error.message.includes("already has a column")) {
       console.log("Column image_url already exists.");
    } else {
       console.error("Migration failed:", error.message);
    }
  } finally {
    process.exit();
  }
}

migrate();
