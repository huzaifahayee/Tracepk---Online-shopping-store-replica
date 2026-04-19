const { sql, getPool } = require('./src/config/db');

const categoryImages = [
  { name: "Babytees", url: "https://groovypakistan.com/cdn/shop/files/5_08379808-dbb9-4dd4-ace8-c94f0d9a2d7d.jpg?crop=center&height=2337&v=1767728787&width=1558" },
  { name: "Cargos", url: "https://groovypakistan.com/cdn/shop/files/23.jpg?crop=center&height=1620&v=1772634037&width=1080" },
  { name: "Denim", url: "https://groovypakistan.com/cdn/shop/files/Oversized-T-Shirts.jpg?crop=center&height=2337&v=1756590171&width=1558" },
  { name: "Essential Tops", url: "https://groovypakistan.com/cdn/shop/files/10_cb67b002-7be1-487d-bc2f-10eeab9392ab.jpg?crop=center&height=2025&v=1756898058&width=1558" },
  { name: "Graphic Tees", url: "https://groovypakistan.com/cdn/shop/files/3_b625e1c7-b688-47e8-97f2-6c168969d9ca.jpg?crop=center&height=2025&v=1767528881&width=1558" },
  { name: "Hoodies", url: "https://groovypakistan.com/cdn/shop/files/5_8fed3e5d-53af-4de5-9b98-4d5cd6268379.jpg?crop=center&height=2025&v=1730900000&width=1558" },
  { name: "Jerseys", url: "https://groovypakistan.com/cdn/shop/files/10_cb67b002-7be1-487d-bc2f-10eeab9392ab.jpg?crop=center&height=2025&v=1756898058&width=1558" },
  { name: "Outerwear", url: "https://groovypakistan.com/cdn/shop/files/23.jpg?crop=center&height=1620&v=1772634037&width=1080" },
  { name: "Sweatpants", url: "https://groovypakistan.com/cdn/shop/files/Oversized-T-Shirts.jpg?crop=center&height=2337&v=1756590171&width=1558" },
  { name: "Tank Tops", url: "https://groovypakistan.com/cdn/shop/files/5_08379808-dbb9-4dd4-ace8-c94f0d9a2d7d.jpg?crop=center&height=2337&v=1767728787&width=1558" }
];

async function seedCategories() {
  try {
    const pool = await getPool();
    for (const cat of categoryImages) {
      await pool.request()
        .input('category_name', sql.VarChar(100), cat.name)
        .input('image_url', sql.VarChar(255), cat.url)
        .query(`
          IF EXISTS (SELECT 1 FROM Categories WHERE category_name = @category_name)
          BEGIN
            UPDATE Categories SET image_url = @image_url WHERE category_name = @category_name;
          END
          ELSE
          BEGIN
            INSERT INTO Categories (category_name, image_url) VALUES (@category_name, @image_url);
          END
        `);
      console.log(`Updated/Inserted Category: ${cat.name}`);
    }
    console.log("Seed complete.");
  } catch (err) {
    console.error("Error seeding categories:", err);
  } finally {
    process.exit();
  }
}

seedCategories();
