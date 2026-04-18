const fs = require('fs');
const path = require('path');
const https = require('https');
const { getPool, sql } = require('./config/db');

// Read JSON data
const rawData = fs.readFileSync(path.join(__dirname, '../groovy_products.json'), 'utf8');
const { products } = JSON.parse(rawData);

// Image download directory
const imageDir = path.join(__dirname, '../../frontend/public/images/products');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Helper to download image
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    // Check if file exists to avoid redownloading
    if (fs.existsSync(dest)) {
      return resolve();
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Map categories based on title
function getCategoryName(title) {
  const lower = title.toLowerCase();
  if (lower.includes('baby tee')) return 'Baby Tees';
  if (lower.includes('tee') || lower.includes('jersey')) return 'T-Shirts';
  if (lower.includes('trouser') || lower.includes('pant') || lower.includes('cargo')) return 'Trousers';
  if (lower.includes('denim')) return 'Denim';
  if (lower.includes('jort')) return 'Jorts';
  if (lower.includes('shirt')) return 'Shirts';
  return 'Accessories';
}

async function seedData() {
  try {
    const pool = await getPool();
    console.log("Connected to database. Starting seed process...");

    // 1. Get or Create Categories
    const categoriesSet = new Set();
    products.forEach(p => categoriesSet.add(getCategoryName(p.title)));
    
    const categoryMap = {}; // name -> id
    
    // Check existing categories
    const existingCats = await pool.request().query('SELECT category_id, category_name FROM Categories');
    existingCats.recordset.forEach(c => {
      categoryMap[c.category_name] = c.category_id;
    });

    for (const catName of categoriesSet) {
      if (!categoryMap[catName]) {
        console.log(`Creating category: ${catName}`);
        const result = await pool.request()
          .input('category_name', sql.VarChar(100), catName)
          .input('description', sql.VarChar(255), `${catName} collection from Groovy`)
          .input('image_url', sql.VarChar(255), null)
          .query(`
            INSERT INTO Categories (category_name, description, image_url)
            OUTPUT INSERTED.category_id
            VALUES (@category_name, @description, @image_url)
          `);
        categoryMap[catName] = result.recordset[0].category_id;
      }
    }

    console.log("Categories ready.");

    // 2. Process Products
    for (const p of products) {
      const catName = getCategoryName(p.title);
      const category_id = categoryMap[catName];
      
      // Basic info
      const product_name = p.title;
      // Truncate description to fit in DB if needed. DB has description VARCHAR(500)
      // Stripping HTML tags simply
      let description = p.body_html ? p.body_html.replace(/<[^>]*>?/gm, '').trim() : '';
      if (description.length > 490) description = description.substring(0, 490) + '...';
      
      // Default Price
      let price = 2500;
      if (p.variants && p.variants.length > 0 && p.variants[0].price) {
        price = parseFloat(p.variants[0].price);
      }
      
      // First Image
      let imageUrl = null;
      let dbImagePath = null;
      if (p.images && p.images.length > 0) {
        imageUrl = p.images[0].src;
        // e.g., image URL format: "https://cdn.shopify.com/.../1_0c3b587c...jpg?v=1775575788"
        // Strip query params
        const cleanUrl = imageUrl.split('?')[0];
        const ext = path.extname(cleanUrl) || '.jpg';
        const filename = `${p.handle || p.id}${ext}`;
        
        dbImagePath = `/images/products/${filename}`;
        const localDest = path.join(imageDir, filename);
        
        console.log(`Downloading image for ${product_name}: ${filename}...`);
        await downloadImage(imageUrl, localDest);
      }
      
      // Insert product base (we can insert each variant as a product, but let's just insert the base product with generic size/color, or insert all variants)
      // Let's insert the first variant's details for now, or just the main product if they are simple
      
      // Check if product already exists by name
      const existingProduct = await pool.request()
        .input('product_name', sql.VarChar(150), product_name)
        .query('SELECT product_id FROM Products WHERE product_name = @product_name');
        
      if (existingProduct.recordset.length === 0) {
        console.log(`Inserting product: ${product_name}`);
        await pool.request()
          .input('category_id', sql.Int, category_id)
          .input('product_name', sql.VarChar(150), product_name)
          .input('description', sql.VarChar(500), description)
          .input('price', sql.Decimal(10, 2), price)
          .input('stock_quantity', sql.Int, 100) // Generic stock
          .input('size', sql.VarChar(20), p.variants?.[0]?.option2 || 'M') // Usually option2 is size
          .input('color', sql.VarChar(50), p.variants?.[0]?.option1 || 'Default') // Usually option1 is color
          .input('image_url', sql.VarChar(255), dbImagePath)
          .query(`
            INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
            VALUES (@category_id, @product_name, @description, @price, @stock_quantity, @size, @color, @image_url)
          `);
      } else {
         // Update image path if needed
         console.log(`Product exists, updating image: ${product_name}`);
         await pool.request()
          .input('product_id', sql.Int, existingProduct.recordset[0].product_id)
          .input('image_url', sql.VarChar(255), dbImagePath)
          .input('description', sql.VarChar(500), description)
          .input('price', sql.Decimal(10, 2), price)
          .query(`
            UPDATE Products 
            SET image_url = @image_url, description = @description, price = @price
            WHERE product_id = @product_id
          `);
      }
    }

    console.log("Seed process completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
}

seedData();
