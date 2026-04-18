const { getPool, sql } = require('./src/config/db');

const categories = [
  { name: "JERSEYS", slug: "jerseys" },
  { name: "DENIM", slug: "denim" },
  { name: "GRAPHIC TEES", slug: "graphic-tees" },
  { name: "SWEATPANTS", slug: "sweatpants-trousers" },
  { name: "CARGOS", slug: "cargos" },
  { name: "ESSENTIAL TOPS", slug: "essential-tops" },
  { name: "TANK TOPS", slug: "tank-tops" },
  { name: "BABYTEES", slug: "babytees" },
  { name: "HOODIES", slug: "hoodies-sweatshirts" },
  { name: "OUTERWEAR", slug: "outerwear" },
];

const products = [
  {
    name: "96 Double Layer Jersey",
    category: "JERSEYS",
    price: 2590,
    stock: 50,
    size: "XS,S,M,L,XL,XXL",
    color: "Electric Blue",
    image: "https://groovypakistan.com/cdn/shop/files/4_aea94a94-ea5c-4083-8296-0ca07282c278.jpg?crop=center&height=2025&v=1756896134&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric. Streetwear meets athletic culture."
  },
  {
    name: "96 Double Layer Jersey (Black)",
    category: "JERSEYS",
    price: 2590,
    stock: 30,
    size: "XS,S,M,L,XL,XXL",
    color: "Black",
    image: "https://groovypakistan.com/cdn/shop/files/1_0c3b587c-3b0d-40b4-bf8f-1a9467b1bbbc.jpg?crop=center&height=2025&v=1775575788&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric."
  },
  {
    name: "CORE Denim (Dark Stone)",
    category: "DENIM",
    price: 3600,
    stock: 20,
    size: "28,30,32,34,36",
    color: "Dark Stone",
    image: "https://groovypakistan.com/cdn/shop/files/1_073cb8a5-e2b6-4a05-8c0e-8e54ed9c7555.jpg?crop=center&height=2025&v=1772897588&width=1558",
    description: "Classic 5-pocket construction. Medium wash. Streetwear-cut silhouette."
  },
  {
    name: "REBIRTH Tee",
    category: "GRAPHIC TEES",
    price: 2490,
    stock: 45,
    size: "XS,S,M,L,XL,XXL",
    color: "Mineral Wash",
    image: "https://groovypakistan.com/cdn/shop/files/9_a6fa3c2d-44ff-4280-bb28-4acef96aaa15.jpg?crop=center&height=2025&v=1756891432&width=1558",
    description: "Mineral washed heavyweight tee. Vintage feel. TRACE graphic print."
  },
  {
    name: "Baggy Trousers",
    category: "SWEATPANTS",
    price: 2490,
    stock: 25,
    size: "XS,S,M,L,XL,XXL",
    color: "Black",
    image: "https://groovypakistan.com/cdn/shop/files/1_fd68d348-5bf2-480c-8a33-6eb176f05e16.jpg?crop=center&height=2025&v=1756296747&width=1558",
    description: "Wide-leg silhouette. Relaxed fit. Everyday streetwear trouser."
  }
];

async function migrate() {
  try {
    const pool = await getPool();
    console.log('Cleaning existing products and categories...');
    // We disable FKs or delete in order
    await pool.request().query("DELETE FROM Order_Items; DELETE FROM Shopping_Cart; DELETE FROM Products; DELETE FROM Categories;");

    const categoryMap = {};

    console.log('Inserting categories...');
    for (const cat of categories) {
      const result = await pool.request()
        .input('name', sql.VarChar(100), cat.name)
        .query("INSERT INTO Categories (category_name) OUTPUT INSERTED.category_id VALUES (@name)");
      categoryMap[cat.name] = result.recordset[0].category_id;
    }

    console.log('Inserting products...');
    for (const prod of products) {
      await pool.request()
        .input('catId', sql.Int, categoryMap[prod.category] || categoryMap['JERSEYS'])
        .input('name', sql.VarChar(150), prod.name)
        .input('desc', sql.VarChar(500), prod.description)
        .input('price', sql.Decimal(10, 2), prod.price)
        .input('stock', sql.Int, prod.stock)
        .input('size', sql.VarChar(20), prod.size)
        .input('color', sql.VarChar(50), prod.color)
        .input('image', sql.VarChar(255), prod.image)
        .query(`
          INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
          VALUES (@catId, @name, @desc, @price, @stock, @size, @color, @image)
        `);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
