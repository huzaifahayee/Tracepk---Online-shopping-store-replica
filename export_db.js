const { sql, getPool } = require('./backend/src/config/db.js');

async function backup() {
  try {
    const pool = await getPool();
    await pool.request().query(`BACKUP DATABASE OnlineClothingBrand TO DISK = 'C:\\Users\\LENOVO\\OneDrive\\Desktop\\Tracepk---Online-shopping-store-replica-main\\Tracepk---Online-shopping-store-replica-main\\database_backup.bak' WITH INIT`);
    console.log('Backup successful');
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

backup();
