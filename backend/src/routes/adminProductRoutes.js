const express = require("express");
const { getPool, sql } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

router.use(requireAdminAuth);

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

router.post(
  "/categories",
  asyncHandler(async (req, res) => {
    const { category_name, description, image_url } = req.body;
    if (!category_name || !String(category_name).trim()) {
      throw new ApiError(400, "VALIDATION_ERROR", "category_name is required");
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("category_name", sql.VarChar(100), String(category_name).trim())
      .input("description", sql.VarChar(255), description || null)
      .input("image_url", sql.VarChar(255), image_url || null)
      .query(`
        INSERT INTO Categories (category_name, description, image_url)
        OUTPUT INSERTED.*
        VALUES (@category_name, @description, @image_url)
      `);

    return res.status(201).json({ success: true, data: result.recordset[0] });
  })
);

router.put(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const category_id = Number(req.params.id);
    const { category_name, description, image_url } = req.body;
    
    if (!category_id) throw new ApiError(400, "VALIDATION_ERROR", "invalid category id");
    if (!category_name || !String(category_name).trim()) {
      throw new ApiError(400, "VALIDATION_ERROR", "category_name is required");
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("category_id", sql.Int, category_id)
      .input("category_name", sql.VarChar(100), String(category_name).trim())
      .input("description", sql.VarChar(255), description || null)
      .input("image_url", sql.VarChar(255), image_url || null)
      .query(`
        UPDATE Categories
        SET category_name = @category_name,
            description = @description,
            image_url = @image_url
        OUTPUT INSERTED.*
        WHERE category_id = @category_id
      `);

    if (result.recordset.length === 0) throw new ApiError(404, "NOT_FOUND", "Category not found");
    return res.json({ success: true, data: result.recordset[0] });
  })
);

router.delete(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const category_id = Number(req.params.id);
    if (!category_id) throw new ApiError(400, "VALIDATION_ERROR", "invalid category id");

    const pool = await getPool();
    // Check if there are products in this category before deleting
    const checkProduct = await pool.request()
      .input("category_id", sql.Int, category_id)
      .query("SELECT COUNT(*) AS count FROM Products WHERE category_id = @category_id");
    
    if (checkProduct.recordset[0].count > 0) {
      throw new ApiError(409, "CONFLICT", "Cannot delete category because it contains products");
    }

    const result = await pool
      .request()
      .input("category_id", sql.Int, category_id)
      .query("DELETE FROM Categories WHERE category_id = @category_id");

    if (result.rowsAffected[0] === 0) throw new ApiError(404, "NOT_FOUND", "Category not found");
    return res.json({ success: true, data: { deleted: true } });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || "").trim();
    const pool = await getPool();
    const result = await pool
      .request()
      .input("search", sql.VarChar(150), `%${search}%`)
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
          p.category_id,
          c.category_name
        FROM Products p
        JOIN Categories c ON p.category_id = c.category_id
        WHERE p.product_name LIKE @search
        ORDER BY p.product_id DESC
      `);

    return res.json({ success: true, data: result.recordset });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      category_id,
      product_name,
      description,
      price,
      stock_quantity,
      size,
      color,
      image_url,
    } = req.body;

    if (!category_id || Number.isNaN(Number(category_id))) {
      throw new ApiError(400, "VALIDATION_ERROR", "category_id is required", "category_id");
    }
    if (!product_name || !String(product_name).trim()) {
      throw new ApiError(400, "VALIDATION_ERROR", "product_name is required", "product_name");
    }
    if (price === undefined || Number(price) <= 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "price must be greater than 0", "price");
    }
    if (stock_quantity === undefined || Number(stock_quantity) < 0) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "stock_quantity must be 0 or more",
        "stock_quantity"
      );
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("category_id", sql.Int, Number(category_id))
      .input("product_name", sql.VarChar(150), String(product_name).trim())
      .input("description", sql.VarChar(500), description || null)
      .input("price", sql.Decimal(10, 2), Number(price))
      .input("stock_quantity", sql.Int, Number(stock_quantity))
      .input("size", sql.VarChar(20), size || null)
      .input("color", sql.VarChar(50), color || null)
      .input("image_url", sql.VarChar(255), image_url || null).query(`
        INSERT INTO Products
          (category_id, product_name, description, price, stock_quantity, size, color, image_url)
        OUTPUT
          INSERTED.product_id,
          INSERTED.product_name,
          INSERTED.description,
          INSERTED.price,
          INSERTED.stock_quantity,
          INSERTED.size,
          INSERTED.color,
          INSERTED.image_url,
          INSERTED.category_id
        VALUES
          (@category_id, @product_name, @description, @price, @stock_quantity, @size, @color, @image_url)
      `);

    return res.status(201).json({ success: true, data: result.recordset[0] });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);
    if (!productId) {
      throw new ApiError(400, "VALIDATION_ERROR", "invalid product id");
    }

    const {
      category_id,
      product_name,
      description,
      price,
      stock_quantity,
      size,
      color,
      image_url,
    } = req.body;

    if (!category_id || Number.isNaN(Number(category_id))) {
      throw new ApiError(400, "VALIDATION_ERROR", "category_id is required", "category_id");
    }
    if (!product_name || !String(product_name).trim()) {
      throw new ApiError(400, "VALIDATION_ERROR", "product_name is required", "product_name");
    }
    if (price === undefined || Number(price) <= 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "price must be greater than 0", "price");
    }
    if (stock_quantity === undefined || Number(stock_quantity) < 0) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "stock_quantity must be 0 or more",
        "stock_quantity"
      );
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("productId", sql.Int, productId)
      .input("category_id", sql.Int, Number(category_id))
      .input("product_name", sql.VarChar(150), String(product_name).trim())
      .input("description", sql.VarChar(500), description || null)
      .input("price", sql.Decimal(10, 2), Number(price))
      .input("stock_quantity", sql.Int, Number(stock_quantity))
      .input("size", sql.VarChar(20), size || null)
      .input("color", sql.VarChar(50), color || null)
      .input("image_url", sql.VarChar(255), image_url || null).query(`
        UPDATE Products
        SET
          category_id = @category_id,
          product_name = @product_name,
          description = @description,
          price = @price,
          stock_quantity = @stock_quantity,
          size = @size,
          color = @color,
          image_url = @image_url
        OUTPUT
          INSERTED.product_id,
          INSERTED.product_name,
          INSERTED.description,
          INSERTED.price,
          INSERTED.stock_quantity,
          INSERTED.size,
          INSERTED.color,
          INSERTED.image_url,
          INSERTED.category_id
        WHERE product_id = @productId
      `);

    const updated = result.recordset[0];
    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "product not found");
    }

    return res.json({ success: true, data: updated });
  })
);

router.delete(
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
      .query("DELETE FROM Products WHERE product_id = @productId");

    if (result.rowsAffected[0] === 0) {
      throw new ApiError(404, "NOT_FOUND", "product not found");
    }

    return res.json({ success: true, data: { deleted: true } });
  })
);

module.exports = router;
