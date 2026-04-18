const { getPool, sql } = require('./src/config/db');
async function run() {
  try {
    const pool = await getPool();
    await pool.request().query("IF NOT EXISTS (SELECT 1 FROM Admins WHERE email='admin@trace.pk') BEGIN INSERT INTO Admins (username, email, full_name, password_hash) VALUES ('admin', 'admin@trace.pk', 'TRACE Admin', 'admin123') END");
    console.log('Admin inserted successfully!');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
run();
