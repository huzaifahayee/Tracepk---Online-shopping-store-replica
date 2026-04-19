const express = require("express");
const { getPool, sql } = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const router = express.Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.userId)
      .query(`
        SELECT
          sc.cart_id,
          sc.product_id,
          sc.quantity,
          p.product_name,
          p.price,
          p.size,
          p.color,
          p.image_url,
          (sc.quantity * p.price) AS subtotal
        FROM Shopping_Cart sc
        JOIN Products p ON sc.product_id = p.product_id
        WHERE sc.user_id = @userId
        ORDER BY sc.date_added DESC
      `);

    return res.json({ success: true, data: result.recordset });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const productId = Number(req.body.product_id);
    const quantity = Number(req.body.quantity || 1);

    if (!productId) {
      throw new ApiError(400, "VALIDATION_ERROR", "product_id is required", "product_id");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(400, "VALIDATION_ERROR", "quantity must be >= 1", "quantity");
    }

    const pool = await getPool();

    const productResult = await pool
      .request()
      .input("productId", sql.Int, productId)
      .query(
        "SELECT product_id, stock_quantity FROM Products WHERE product_id = @productId"
      );

    const product = productResult.recordset[0];
    if (!product) {
      throw new ApiError(404, "NOT_FOUND", "product not found");
    }

    const existingResult = await pool
      .request()
      .input("userId", sql.Int, req.user.userId)
      .input("productId", sql.Int, productId)
      .query(`
        SELECT cart_id, quantity
        FROM Shopping_Cart
        WHERE user_id = @userId AND product_id = @productId
      `);

    const existing = existingResult.recordset[0];
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock_quantity) {
        throw new ApiError(409, "CONFLICT", "requested quantity exceeds stock");
      }

      await pool
        .request()
        .input("cartId", sql.Int, existing.cart_id)
        .input("quantity", sql.Int, newQty)
        .query("UPDATE Shopping_Cart SET quantity = @quantity WHERE cart_id = @cartId");

      return res.json({ success: true, message: "Cart updated" });
    }

    if (quantity > product.stock_quantity) {
      throw new ApiError(409, "CONFLICT", "requested quantity exceeds stock");
    }

    await pool
      .request()
      .input("userId", sql.Int, req.user.userId)
      .input("productId", sql.Int, productId)
      .input("quantity", sql.Int, quantity)
      .query(`
        INSERT INTO Shopping_Cart (user_id, product_id, quantity)
        VALUES (@userId, @productId, @quantity)
      `);

    return res.status(201).json({ success: true, message: "Added to cart" });
  })
);

router.put(
  "/:cartId",
  asyncHandler(async (req, res) => {
    const cartId = Number(req.params.cartId);
    const quantity = Number(req.body.quantity);

    if (!cartId) {
      throw new ApiError(400, "VALIDATION_ERROR", "invalid cart id");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(400, "VALIDATION_ERROR", "quantity must be >= 1", "quantity");
    }

    const pool = await getPool();
    const existingResult = await pool
      .request()
      .input("cartId", sql.Int, cartId)
      .input("userId", sql.Int, req.user.userId)
      .query(`
        SELECT sc.cart_id, sc.product_id, p.stock_quantity
        FROM Shopping_Cart sc
        JOIN Products p ON sc.product_id = p.product_id
        WHERE sc.cart_id = @cartId AND sc.user_id = @userId
      `);

    const existing = existingResult.recordset[0];
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "cart item not found");
    }
    if (quantity > existing.stock_quantity) {
      throw new ApiError(409, "CONFLICT", "requested quantity exceeds stock");
    }

    await pool
      .request()
      .input("cartId", sql.Int, cartId)
      .input("quantity", sql.Int, quantity)
      .query("UPDATE Shopping_Cart SET quantity = @quantity WHERE cart_id = @cartId");

    return res.json({ success: true, message: "Cart quantity updated" });
  })
);

router.delete(
  "/:cartId",
  asyncHandler(async (req, res) => {
    const cartId = Number(req.params.cartId);
    if (!cartId) {
      throw new ApiError(400, "VALIDATION_ERROR", "invalid cart id");
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("cartId", sql.Int, cartId)
      .input("userId", sql.Int, req.user.userId)
      .query("DELETE FROM Shopping_Cart WHERE cart_id = @cartId AND user_id = @userId");

    if (result.rowsAffected[0] === 0) {
      throw new ApiError(404, "NOT_FOUND", "cart item not found");
    }

    return res.status(204).send();
  })
);

module.exports = router;

