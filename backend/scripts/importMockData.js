require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { getPool, sql } = require("../src/config/db");
const fs = require("fs");
const path = require("path");

const MOCK_CATEGORIES = [
  { name: "JERSEYS", description: "Jerseys category." },
  { name: "DENIM", description: "Denim and jeans." },
  { name: "GRAPHIC TEES", description: "Graphic t-shirts." },
  { name: "SWEATPANTS & TROUSERS", description: "Sweatpants and trousers." },
  { name: "CARGOS", description: "Cargo pants." },
  { name: "ESSENTIAL TOPS", description: "Basic everyday tops." },
  { name: "TANK TOPS", description: "Tank tops and sleeveless." },
  { name: "BABYTEES", description: "Baby tees." },
  { name: "HOODIES", description: "Hoodies and sweatshirts." },
  { name: "OUTERWEAR", description: "Jackets and outerwear." },
];

const MOCK_PRODUCTS = [
  {
    name: "96 Double Layer Jersey",
    category: "JERSEYS",
    price: 2590,
    stock_quantity: 100,
    size: "L",
    color: "Electric Blue",
    image_url: "https://groovypakistan.com/cdn/shop/files/4_aea94a94-ea5c-4083-8296-0ca07282c278.jpg?crop=center&height=2025&v=1756896134&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric. Streetwear meets athletic culture.",
  },
  {
    name: "96 Double Layer Jersey",
    category: "JERSEYS",
    price: 2590,
    stock_quantity: 100,
    size: "L",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_0c3b587c-3b0d-40b4-bf8f-1a9467b1bbbc.jpg?crop=center&height=2025&v=1775575788&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric.",
  },
  {
    name: "96 Double Layer Jersey",
    category: "JERSEYS",
    price: 2590,
    stock_quantity: 100,
    size: "L",
    color: "Frost Blue",
    image_url: "https://groovypakistan.com/cdn/shop/files/12_8721e3f1-dd01-4aec-a248-703f8780f3bf.jpg?crop=center&height=2025&v=1756895707&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric.",
  },
  {
    name: "96 Double Layer Jersey",
    category: "JERSEYS",
    price: 2590,
    stock_quantity: 100,
    size: "L",
    color: "Racing Green",
    image_url: "https://groovypakistan.com/cdn/shop/files/14_17bae632-c615-43bd-a22c-6075517be7fe.jpg?crop=center&height=2025&v=1756894523&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric.",
  },
  {
    name: "96 Double Layer Jersey",
    category: "JERSEYS",
    price: 2590,
    stock_quantity: 100,
    size: "L",
    color: "Mocha Brown",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_b4175311-da33-4136-85f2-b8d296a1715d.jpg?crop=center&height=2025&v=1755776524&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric.",
  },
  {
    name: "CORE Denim",
    category: "DENIM",
    price: 3600,
    stock_quantity: 100,
    size: "32",
    color: "Dark Stone",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_073cb8a5-e2b6-4a05-8c0e-8e54ed9c7555.jpg?crop=center&height=2025&v=1772897588&width=1558",
    description: "Classic 5-pocket construction. Medium wash. Streetwear-cut silhouette.",
  },
  {
    name: "Jorts",
    category: "DENIM",
    price: 2400,
    stock_quantity: 100,
    size: "32",
    color: "Dark Stone",
    image_url: "https://groovypakistan.com/cdn/shop/files/5_c1f094c2-34c6-4132-8647-b186d07ecad2.jpg?crop=center&height=2025&v=1767735827&width=1558",
    description: "Above-knee denim shorts. Raw hem finish. Summer staple.",
  },
  {
    name: "CORE Denim",
    category: "DENIM",
    price: 3600,
    stock_quantity: 100,
    size: "32",
    color: "White Stone",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_38eab3b3-0e8c-44ab-ae20-a5e7c021108f.jpg?crop=center&height=2025&v=1772897363&width=1558",
    description: "Light wash denim. Clean minimal finish.",
  },
  {
    name: "REBIRTH Tee",
    category: "GRAPHIC TEES",
    price: 2490,
    stock_quantity: 100,
    size: "L",
    color: "Mineral Wash",
    image_url: "https://groovypakistan.com/cdn/shop/files/9_a6fa3c2d-44ff-4280-bb28-4acef96aaa15.jpg?crop=center&height=2025&v=1756891432&width=1558",
    description: "Mineral washed heavyweight tee. Vintage feel. TRACE graphic print.",
  },
  {
    name: "Afterdark Piping Top",
    category: "GRAPHIC TEES",
    price: 2590,
    stock_quantity: 100,
    size: "L",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/4332.jpg?crop=center&height=2025&v=1747135205&width=1558",
    description: "Contrast piping detail. Long sleeve. Statement streetwear piece.",
  },
  {
    name: "ROLLER TEE",
    category: "GRAPHIC TEES",
    price: 2590,
    stock_quantity: 100,
    size: "L",
    color: "Black + White",
    image_url: "https://groovypakistan.com/cdn/shop/files/3_6ebb33cf-b84b-4ca6-b31f-2010ae6153d0.jpg?crop=center&height=2025&v=1755899622&width=1558",
    description: "Bold graphic print. Premium cotton. Street-ready silhouette.",
  },
  {
    name: "SOLO LEVELING",
    category: "GRAPHIC TEES",
    price: 2290,
    stock_quantity: 100,
    size: "L",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/9_162c6b36-7a1d-497c-8058-bbc3c7d6f43a.jpg?crop=center&height=2025&v=1756893713&width=1558",
    description: "Anime-inspired graphic. Heavy cotton. Collector's piece.",
  },
  {
    name: "Institute of GRVY",
    category: "GRAPHIC TEES",
    price: 2290,
    stock_quantity: 100,
    size: "L",
    color: "Black + White",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_d342b41a-852c-4748-a78f-1dd1a93c4e37.jpg?crop=center&height=2025&v=1756293017&width=1558",
    description: "Collegiate-inspired graphic. Premium cotton construction.",
  },
  {
    name: "Young & Turnt Tee",
    category: "GRAPHIC TEES",
    price: 2290,
    stock_quantity: 100,
    size: "L",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_961722c2-6656-4397-80db-5b01965ca3f9.jpg?crop=center&height=2025&v=1756893545&width=1558",
    description: "Statement graphic. Youth culture inspired. Heavy cotton.",
  },
  {
    name: "Alpha Jersey",
    category: "JERSEYS",
    price: 2290,
    stock_quantity: 100,
    size: "L",
    color: "Mocha Brown",
    image_url: "https://groovypakistan.com/cdn/shop/files/2_2199590b-0c3e-4781-a840-c8a476168c16.jpg?crop=center&height=2025&v=1755781582&width=1558",
    description: "Lightweight mesh jersey. Athletic-inspired streetwear.",
  },
  {
    name: "Superman Full Sleeves Tee",
    category: "GRAPHIC TEES",
    price: 2590,
    stock_quantity: 100,
    size: "L",
    color: "Frost + Electric Blue",
    image_url: "https://groovypakistan.com/cdn/shop/files/2_1479ad23-9c8a-4123-81ee-e998e0503266.jpg?crop=center&height=2025&v=1756892560&width=1558",
    description: "Full sleeve graphic tee. Pop culture meets streetwear.",
  },
  {
    name: "Baggy Trousers",
    category: "SWEATPANTS & TROUSERS",
    price: 2490,
    stock_quantity: 100,
    size: "M",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_fd68d348-5bf2-480c-8a33-6eb176f05e16.jpg?crop=center&height=2025&v=1756296747&width=1558",
    description: "Wide-leg silhouette. Relaxed fit. Everyday streetwear trouser.",
  },
  {
    name: "Baggy Trousers",
    category: "SWEATPANTS & TROUSERS",
    price: 2490,
    stock_quantity: 100,
    size: "M",
    color: "Mocha Brown",
    image_url: "https://groovypakistan.com/cdn/shop/files/4_50f3fa05-251e-405f-b037-f8d71e1809cd.jpg?crop=center&height=2025&v=1756296793&width=1558",
    description: "Wide-leg silhouette. Relaxed fit. Everyday streetwear trouser.",
  },
  {
    name: "CORE Tees",
    category: "ESSENTIAL TOPS",
    price: 2290,
    stock_quantity: 0,
    size: "L",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/5_965b141a-ad1e-41e2-a463-c9df8897cadc.jpg?crop=center&height=2025&v=1741981383&width=1558",
    description: "Essential blank tee. Premium cotton. The perfect base layer.",
  },
  {
    name: "Jorts",
    category: "DENIM",
    price: 2400,
    stock_quantity: 0,
    size: "32",
    color: "White Stone",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_3420be6d-52c3-4854-83ae-1e70511674ea.jpg?crop=center&height=2025&v=1772897986&width=1558",
    description: "Light wash denim shorts. Above-knee cut. Summer essential.",
  }
];

// Mock orders for account pages
const MOCK_ORDERS = [
  {
    user_id: 1, // 'Saad_The_Cook'
    order_date: '2025-04-15T10:30:00Z',
    order_status: 'Delivered',
    payment_method: 'Cash on Delivery',
    delivery_address: 'House 5, Model Town, Lahore',
    total_amount: 5180,
    items: [
      { product_name: '96 Double Layer Jersey', quantity: 2, unit_price: 2590 },
    ],
  },
  {
    user_id: 2, // 'huZaifa_Beard'
    order_date: '2025-04-16T14:20:00Z',
    order_status: 'Shipped',
    payment_method: 'Cash on Delivery',
    delivery_address: 'House 5, Model Town, Lahore',
    total_amount: 3600,
    items: [
      { product_name: 'CORE Denim', quantity: 1, unit_price: 3600 },
    ],
  },
];

async function runImport() {
  try {
    const pool = await getPool();
    console.log("Connected to MSSQL");

    // 1. Insert Categories
    for (const cat of MOCK_CATEGORIES) {
      await pool.request()
        .input('name', sql.VarChar(100), cat.name)
        .input('desc', sql.VarChar(255), cat.description)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = @name)
          BEGIN
            INSERT INTO Categories (category_name, description) VALUES (@name, @desc)
          END
        `);
    }
    console.log("Categories imported.");

    // 2. Insert Products
    for (const prod of MOCK_PRODUCTS) {
      // Find category ID
      const catRes = await pool.request()
        .input('name', sql.VarChar(100), prod.category)
        .query(`SELECT category_id FROM Categories WHERE category_name = @name`);
      
      let category_id = 1;
      if (catRes.recordset.length > 0) {
        category_id = catRes.recordset[0].category_id;
      }

      await pool.request()
        .input('catId', sql.Int, category_id)
        .input('name', sql.VarChar(150), prod.name)
        .input('desc', sql.VarChar(500), prod.description)
        .input('price', sql.Decimal(10, 2), prod.price)
        .input('stock', sql.Int, prod.stock_quantity)
        .input('size', sql.VarChar(20), prod.size)
        .input('col', sql.VarChar(50), prod.color)
        .input('img', sql.VarChar(255), prod.image_url)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = @name AND color = @col)
          BEGIN
            INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
            VALUES (@catId, @name, @desc, @price, @stock, @size, @col, @img)
          END
        `);
    }
    console.log("Products imported.");

    // 3. Insert Orders
    for (const order of MOCK_ORDERS) {
      // Check if order exists (roughly by user and amount and date)
      const exRes = await pool.request()
        .input('userId', sql.Int, order.user_id)
        .input('total', sql.Decimal(10, 2), order.total_amount)
        .query(`SELECT TOP 1 order_id FROM Orders WHERE user_id = @userId AND total_amount = @total`);
        
      if (exRes.recordset.length === 0) {
        const orderRes = await pool.request()
          .input('userId', sql.Int, order.user_id)
          .input('amount', sql.Decimal(10, 2), order.total_amount)
          .input('method', sql.VarChar(50), order.payment_method)
          .input('address', sql.VarChar(255), order.delivery_address)
          .input('status', sql.VarChar(20), order.order_status)
          .query(`
            INSERT INTO Orders (user_id, total_amount, payment_method, delivery_address, order_status, order_date)
            OUTPUT INSERTED.order_id
            VALUES (@userId, @amount, @method, @address, @status, GETDATE())
          `);

        const orderId = orderRes.recordset[0].order_id;

        for (const item of order.items) {
          // Find product ID
          const prodRes = await pool.request()
            .input('name', sql.VarChar(150), item.product_name)
            .query(`SELECT TOP 1 product_id FROM Products WHERE product_name = @name`);
          
          let productId = 1; // fallback
          if (prodRes.recordset.length > 0) {
            productId = prodRes.recordset[0].product_id;
          }

          await pool.request()
            .input('orderId', sql.Int, orderId)
            .input('prodId', sql.Int, productId)
            .input('qty', sql.Int, item.quantity)
            .input('price', sql.Decimal(10, 2), item.unit_price)
            .query(`
              INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)
              VALUES (@orderId, @prodId, @qty, @price)
            `);
        }
      }
    }
    console.log("Orders imported.");
    console.log("Done importing all mock data.");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runImport();
