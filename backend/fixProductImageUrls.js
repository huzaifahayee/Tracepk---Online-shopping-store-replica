/**
 * Sets every Products.image_url to a working Groovy CDN URL (cycles through catalog photos).
 * Run from backend/: node fixProductImageUrls.js
 */
const { sql, getPool } = require("./src/config/db");

const CDN_IMAGES = [
  "https://groovypakistan.com/cdn/shop/files/4_aea94a94-ea5c-4083-8296-0ca07282c278.jpg?crop=center&height=2025&v=1756896134&width=1558",
  "https://groovypakistan.com/cdn/shop/files/1_0c3b587c-3b0d-40b4-bf8f-1a9467b1bbbc.jpg?crop=center&height=2025&v=1775575788&width=1558",
  "https://groovypakistan.com/cdn/shop/files/12_8721e3f1-dd01-4aec-a248-703f8780f3bf.jpg?crop=center&height=2025&v=1756895707&width=1558",
  "https://groovypakistan.com/cdn/shop/files/14_17bae632-c615-43bd-a22c-6075517be7fe.jpg?crop=center&height=2025&v=1756894523&width=1558",
  "https://groovypakistan.com/cdn/shop/files/1_b4175311-da33-4136-85f2-b8d296a1715d.jpg?crop=center&height=2025&v=1755776524&width=1558",
  "https://groovypakistan.com/cdn/shop/files/1_073cb8a5-e2b6-4a05-8c0e-8e54ed9c7555.jpg?crop=center&height=2025&v=1772897588&width=1558",
  "https://groovypakistan.com/cdn/shop/files/5_c1f094c2-34c6-4132-8647-b186d07ecad2.jpg?crop=center&height=2025&v=1767735827&width=1558",
  "https://groovypakistan.com/cdn/shop/files/1_38eab3b3-0e8c-44ab-ae20-a5e7c021108f.jpg?crop=center&height=2025&v=1772897363&width=1558",
  "https://groovypakistan.com/cdn/shop/files/9_a6fa3c2d-44ff-4280-bb28-4acef96aaa15.jpg?crop=center&height=2025&v=1756891432&width=1558",
  "https://groovypakistan.com/cdn/shop/files/4332.jpg?crop=center&height=2025&v=1747135205&width=1558",
  "https://groovypakistan.com/cdn/shop/files/3_6ebb33cf-b84b-4ca6-b31f-2010ae6153d0.jpg?crop=center&height=2025&v=1755899622&width=1558",
  "https://groovypakistan.com/cdn/shop/files/9_162c6b36-7a1d-497c-8058-bbc3c7d6f43a.jpg?crop=center&height=2025&v=1756893713&width=1558",
  "https://groovypakistan.com/cdn/shop/files/1_d342b41a-852c-4748-a78f-1dd1a93c4e37.jpg?crop=center&height=2025&v=1756293017&width=1558",
  "https://groovypakistan.com/cdn/shop/files/1_961722c2-6656-4397-80db-5b01965ca3f9.jpg?crop=center&height=2025&v=1756893545&width=1558",
  "https://groovypakistan.com/cdn/shop/files/2_2199590b-0c3e-4781-a840-c8a476168c16.jpg?crop=center&height=2025&v=1755781582&width=1558",
  "https://groovypakistan.com/cdn/shop/files/2_1479ad23-9c8a-4123-81ee-e998e0503266.jpg?crop=center&height=2025&v=1756892560&width=1558",
  "https://groovypakistan.com/cdn/shop/files/1_fd68d348-5bf2-480c-8a33-6eb176f05e16.jpg?crop=center&height=2025&v=1756296747&width=1558",
  "https://groovypakistan.com/cdn/shop/files/4_50f3fa05-251e-405f-b037-f8d71e1809cd.jpg?crop=center&height=2025&v=1756296793&width=1558",
  "https://groovypakistan.com/cdn/shop/files/5_965b141a-ad1e-41e2-a463-c9df8897cadc.jpg?crop=center&height=2025&v=1741981383&width=1558",
];

async function main() {
  const pool = await getPool();
  const { recordset } = await pool.request().query(
    "SELECT product_id FROM Products ORDER BY product_id"
  );

  if (recordset.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No products to update.");
    process.exit(0);
    return;
  }

  for (let i = 0; i < recordset.length; i++) {
    const url = CDN_IMAGES[i % CDN_IMAGES.length];
    await pool
      .request()
      .input("id", sql.Int, recordset[i].product_id)
      .input("url", sql.VarChar(255), url)
      .query("UPDATE Products SET image_url = @url WHERE product_id = @id");
    // eslint-disable-next-line no-console
    console.log(`Updated product_id ${recordset[i].product_id}`);
  }

  // eslint-disable-next-line no-console
  console.log(`Done. ${recordset.length} product(s) now use CDN image URLs.`);
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
