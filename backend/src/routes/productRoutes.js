const express = require("express");
const { getPool, sql } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.max(Math.min(Number(req.query.limit || 12), 50), 1);
    const offset = (page - 1) * limit;

    const sortMap = {
      price_asc: "p.price ASC",
      price_desc: "p.price DESC",
      newest: "p.date_added DESC",
    };

    const sort = sortMap[req.query.sort] || "p.product_id DESC";
    const search = req.query.search || "";
    const category = req.query.category ? Number(req.query.category) : null;

    const pool = await getPool();
    const request = pool
      .request()
      .input("search", sql.VarChar(150), `%${search}%`)
      .input("category", sql.Int, category)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit);

    const dataQuery = `
      SELECT
        p.product_id,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.size,
        p.color,
        p.image_url,
        p.date_added,
        c.category_id,
        c.category_name
      FROM Products p
      JOIN Categories c ON p.category_id = c.category_id
      WHERE (@category IS NULL OR p.category_id = @category)
        AND p.product_name LIKE @search
      ORDER BY ${sort}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Products p
      WHERE (@category IS NULL OR p.category_id = @category)
        AND p.product_name LIKE @search
    `;

    const [itemsResult, countResult] = await Promise.all([
      request.query(dataQuery),
      pool
        .request()
        .input("search", sql.VarChar(150), `%${search}%`)
        .input("category", sql.Int, category)
        .query(countQuery),
    ]);

    return res.json({
      success: true,
      data: {
        items: itemsResult.recordset,
        pagination: {
          page,
          limit,
          total: countResult.recordset[0].total,
        },
      },
    });
  })
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT category_id, category_name, description, image_url
      FROM Categories
      ORDER BY category_name ASC
    `);

    return res.json({ success: true, data: result.recordset });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);
    if (!productId) {
      throw new ApiError(400, "VALIDATION_ERROR", "invalid product id");
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("productId", sql.Int, productId)
      .query(`
        SELECT
          p.product_id,
          p.product_name,
          p.description,
          p.price,
          p.stock_quantity,
          p.size,
          p.color,
          p.image_url,
          p.date_added,
          c.category_id,
          c.category_name
        FROM Products p
        JOIN Categories c ON p.category_id = c.category_id
        WHERE p.product_id = @productId
      `);

    const product = result.recordset[0];
    if (!product) {
      throw new ApiError(404, "NOT_FOUND", "product not found");
    }

    return res.json({ success: true, data: product });
  })
);

module.exports = router;

