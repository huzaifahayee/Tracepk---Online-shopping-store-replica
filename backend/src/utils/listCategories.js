const { getPool } = require("../config/db");

/** Lab SQL omits image_url until migrateCategory.js runs */
let cachedHasImageUrlColumn;

async function categoriesHasImageUrl(pool) {
  if (cachedHasImageUrlColumn !== undefined) return cachedHasImageUrlColumn;
  try {
    const result = await pool.request().query(`
      SELECT 1 AS ok
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'image_url'
    `);
    cachedHasImageUrlColumn = result.recordset.length > 0;
  } catch {
    cachedHasImageUrlColumn = false;
  }
  return cachedHasImageUrlColumn;
}

/** SELECT all categories — works whether or not image_url exists */
async function listCategoriesResult() {
  const pool = await getPool();
  const hasImg = await categoriesHasImageUrl(pool);
  const sql = hasImg
    ? `
      SELECT category_id, category_name, description, image_url
      FROM Categories
      ORDER BY category_name ASC
    `
    : `
      SELECT category_id, category_name, description
      FROM Categories
      ORDER BY category_name ASC
    `;
  return pool.request().query(sql);
}

module.exports = { listCategoriesResult };
