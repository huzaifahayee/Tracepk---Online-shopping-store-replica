const { sql, getPool } = require('./src/config/db');

async function migrateSettings() {
  try {
    const pool = await getPool();
    await pool.request().query("CREATE TABLE Settings (setting_key VARCHAR(50) PRIMARY KEY, setting_value VARCHAR(500));");
    await pool.request().query("INSERT INTO Settings (setting_key, setting_value) VALUES ('announcement_text', 'FREE SHIPPING ON ORDERS OVER RS.10,000 ★ TRACE™ ★ NEW DROP LIVE NOW ★ LIMITED STOCK ★ EASY RETURNS ★ COD AVAILABLE ★ ');");
    console.log("Migration successful: Added Settings table.");
  } catch (error) {
    if (error.message.includes("already exists")) {
       console.log("Settings table already exists.");
    } else {
       console.error("Migration failed:", error.message);
    }
  } finally {
    process.exit();
  }
}

migrateSettings();
