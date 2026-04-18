const { sql, getPool } = require('./src/config/db');

// Original mock data
const MOCK_PRODUCTS = [
  {
    name: "96 Double Layer Jersey",
    category: "Jerseys",
    price: 2590,
    stock_quantity: 12,
    size: "XS,S,M,L,XL,XXL",
    color: "Electric Blue,Black,Frost Blue,Racing Green,Mocha",
    image_url: "https://groovypakistan.com/cdn/shop/files/4_aea94a94-ea5c-4083-8296-0ca07282c278.jpg?crop=center&height=2025&v=1756896134&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric. Streetwear meets athletic culture."
  },
  {
    name: "96 Double Layer Jersey (Black)",
    category: "Jerseys",
    price: 2590,
    stock_quantity: 15,
    size: "XS,S,M,L,XL,XXL",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_0c3b587c-3b0d-40b4-bf8f-1a9467b1bbbc.jpg?crop=center&height=2025&v=1775575788&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric."
  },
  {
    name: "96 Double Layer Jersey (Frost)",
    category: "Jerseys",
    price: 2590,
    stock_quantity: 8,
    size: "XS,S,M,L,XL,XXL",
    color: "Frost Blue",
    image_url: "https://groovypakistan.com/cdn/shop/files/12_8721e3f1-dd01-4aec-a248-703f8780f3bf.jpg?crop=center&height=2025&v=1756895707&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric."
  },
  {
    name: "96 Double Layer Jersey (Racing)",
    category: "Jerseys",
    price: 2590,
    stock_quantity: 20,
    size: "XS,S,M,L,XL,XXL",
    color: "Racing Green",
    image_url: "https://groovypakistan.com/cdn/shop/files/14_17bae632-c615-43bd-a22c-6075517be7fe.jpg?crop=center&height=2025&v=1756894523&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric."
  },
  {
    name: "96 Double Layer Jersey (Mocha)",
    category: "Jerseys",
    price: 2590,
    stock_quantity: 5,
    size: "XS,S,M,L,XL,XXL",
    color: "Mocha Brown",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_b4175311-da33-4136-85f2-b8d296a1715d.jpg?crop=center&height=2025&v=1755776524&width=1558",
    description: "Double-layer mesh construction. Moisture-wicking fabric."
  },
  {
    name: "CORE Denim",
    category: "Denim",
    price: 3600,
    stock_quantity: 18,
    size: "28,30,32,34,36",
    color: "Dark Stone",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_073cb8a5-e2b6-4a05-8c0e-8e54ed9c7555.jpg?crop=center&height=2025&v=1772897588&width=1558",
    description: "Classic 5-pocket construction. Medium wash. Streetwear-cut silhouette."
  },
  {
    name: "Jorts",
    category: "Denim",
    price: 2400,
    stock_quantity: 25,
    size: "28,30,32,34,36",
    color: "Dark Stone",
    image_url: "https://groovypakistan.com/cdn/shop/files/5_c1f094c2-34c6-4132-8647-b186d07ecad2.jpg?crop=center&height=2025&v=1767735827&width=1558",
    description: "Above-knee denim shorts. Raw hem finish. Summer staple."
  },
  {
    name: "CORE Denim (Light)",
    category: "Denim",
    price: 3600,
    stock_quantity: 11,
    size: "28,30,32,34,36",
    color: "White Stone",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_38eab3b3-0e8c-44ab-ae20-a5e7c021108f.jpg?crop=center&height=2025&v=1772897363&width=1558",
    description: "Light wash denim. Clean minimal finish."
  },
  {
    name: "REBIRTH Tee",
    category: "Graphic Tees",
    price: 2490,
    stock_quantity: 30,
    size: "XS,S,M,L,XL,XXL",
    color: "Mineral Wash",
    image_url: "https://groovypakistan.com/cdn/shop/files/9_a6fa3c2d-44ff-4280-bb28-4acef96aaa15.jpg?crop=center&height=2025&v=1756891432&width=1558",
    description: "Mineral washed heavyweight tee. Vintage feel. TRACE graphic print."
  },
  {
    name: "Afterdark Piping Top",
    category: "Graphic Tees",
    price: 2590,
    stock_quantity: 22,
    size: "XS,S,M,L,XL,XXL",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/4332.jpg?crop=center&height=2025&v=1747135205&width=1558",
    description: "Contrast piping detail. Long sleeve. Statement streetwear piece."
  },
  {
    name: "ROLLER TEE",
    category: "Graphic Tees",
    price: 2590,
    stock_quantity: 40,
    size: "XS,S,M,L,XL,XXL",
    color: "Black + White",
    image_url: "https://groovypakistan.com/cdn/shop/files/3_6ebb33cf-b84b-4ca6-b31f-2010ae6153d0.jpg?crop=center&height=2025&v=1755899622&width=1558",
    description: "Bold graphic print. Premium cotton. Street-ready silhouette."
  },
  {
    name: "SOLO LEVELING",
    category: "Graphic Tees",
    price: 2290,
    stock_quantity: 6,
    size: "XS,S,M,L,XL,XXL",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/9_162c6b36-7a1d-497c-8058-bbc3c7d6f43a.jpg?crop=center&height=2025&v=1756893713&width=1558",
    description: "Anime-inspired graphic. Heavy cotton. Collector's piece."
  },
  {
    name: "Institute of GRVY",
    category: "Graphic Tees",
    price: 2290,
    stock_quantity: 14,
    size: "XS,S,M,L,XL,XXL",
    color: "Black + White",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_d342b41a-852c-4748-a78f-1dd1a93c4e37.jpg?crop=center&height=2025&v=1756293017&width=1558",
    description: "Collegiate-inspired graphic. Premium cotton construction."
  },
  {
    name: "Young & Turnt Tee",
    category: "Graphic Tees",
    price: 2290,
    stock_quantity: 35,
    size: "XS,S,M,L,XL,XXL",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_961722c2-6656-4397-80db-5b01965ca3f9.jpg?crop=center&height=2025&v=1756893545&width=1558",
    description: "Statement graphic. Youth culture inspired. Heavy cotton."
  },
  {
    name: "Alpha Jersey",
    category: "Jerseys",
    price: 2290,
    stock_quantity: 19,
    size: "XS,S,M,L,XL,XXL",
    color: "Mocha Brown",
    image_url: "https://groovypakistan.com/cdn/shop/files/2_2199590b-0c3e-4781-a840-c8a476168c16.jpg?crop=center&height=2025&v=1755781582&width=1558",
    description: "Lightweight mesh jersey. Athletic-inspired streetwear."
  },
  {
    name: "Superman Full Sleeves Tee",
    category: "Graphic Tees",
    price: 2590,
    stock_quantity: 2,
    size: "XS,S,M,L,XL,XXL",
    color: "Frost + Electric Blue",
    image_url: "https://groovypakistan.com/cdn/shop/files/2_1479ad23-9c8a-4123-81ee-e998e0503266.jpg?crop=center&height=2025&v=1756892560&width=1558",
    description: "Full sleeve graphic tee. Pop culture meets streetwear."
  },
  {
    name: "Baggy Trousers",
    category: "Sweatpants",
    price: 2490,
    stock_quantity: 0,
    size: "XS,S,M,L,XL,XXL",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/1_fd68d348-5bf2-480c-8a33-6eb176f05e16.jpg?crop=center&height=2025&v=1756296747&width=1558",
    description: "Wide-leg silhouette. Relaxed fit. Everyday streetwear trouser."
  },
  {
    name: "Baggy Trousers (Mocha)",
    category: "Sweatpants",
    price: 2490,
    stock_quantity: 9,
    size: "XS,S,M,L,XL,XXL",
    color: "Mocha Brown",
    image_url: "https://groovypakistan.com/cdn/shop/files/4_50f3fa05-251e-405f-b037-f8d71e1809cd.jpg?crop=center&height=2025&v=1756296793&width=1558",
    description: "Wide-leg silhouette. Relaxed fit. Everyday streetwear trouser."
  },
  {
    name: "CORE Tees",
    category: "Essential Tops",
    price: 2290,
    stock_quantity: 45,
    size: "XS,S,M,L,XL,XXL",
    color: "Black",
    image_url: "https://groovypakistan.com/cdn/shop/files/5_965b141a-ad1e-41e2-a463-c9df8897cadc.jpg?crop=center&height=2025&v=1741981383&width=1558",
    description: "Essential blank tee. Premium cotton. The perfect base layer."
  },
];

async function seedProducts() {
  try {
    const pool = await getPool();
    
    // Leaving existing products intact to prevent Foreign Key reference errors.
    console.log("Leaving existing Products intact (Orders depend on them).");
    
    for (const p of MOCK_PRODUCTS) {
      // Find category_id
      const catResult = await pool.request()
        .input('category', sql.VarChar(100), p.category)
        .query('SELECT category_id FROM Categories WHERE category_name = @category');
        
      let categoryId;
      if (catResult.recordset.length > 0) {
        categoryId = catResult.recordset[0].category_id;
      } else {
        // Fallback default
        const fallback = await pool.request().query('SELECT TOP 1 category_id FROM Categories');
        categoryId = fallback.recordset[0].category_id;
      }

      await pool.request()
        .input('category_id', sql.Int, categoryId)
        .input('product_name', sql.VarChar(150), p.name)
        .input('description', sql.VarChar(500), p.description)
        .input('price', sql.Decimal(10, 2), p.price)
        .input('stock_quantity', sql.Int, p.stock_quantity)
        .input('size', sql.VarChar(200), p.size)
        .input('color', sql.VarChar(100), p.color)
        .input('image_url', sql.VarChar(255), p.image_url)
        .query(`
          INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
          VALUES (@category_id, @product_name, @description, @price, @stock_quantity, @size, @color, @image_url)
        `);
        
      console.log(`Inserted mock product: ${p.name}`);
    }
    
    console.log("Mock product seeding complete.");
  } catch (err) {
    console.error("Error seeding products:", err);
  } finally {
    process.exit();
  }
}

seedProducts();
