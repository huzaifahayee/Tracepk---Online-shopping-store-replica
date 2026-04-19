const express = require("express");
const { getPool, sql } = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const router = express.Router();

router.use(requireAuth);

// GET /orders — list orders for the logged-in customer
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool.request()
      .input("userId", sql.Int, req.user.userId)
      .query(`
        SELECT
          o.order_id,
          o.order_date,
          o.order_status,
          o.payment_method,
          o.delivery_address,
          o.total_amount
        FROM Orders o
        WHERE o.user_id = @userId
        ORDER BY o.order_date DESC
      `);

    return res.json({ success: true, data: result.recordset });
  })
);

// GET /orders/:id — single order details with items
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const pool = await getPool();

    const orderResult = await pool.request()
      .input("orderId", sql.Int, orderId)
      .input("userId", sql.Int, req.user.userId)
      .query(`
        SELECT order_id, order_date, order_status, payment_method, delivery_address, total_amount
        FROM Orders
        WHERE order_id = @orderId AND user_id = @userId
      `);

    const order = orderResult.recordset[0];
    if (!order) {
      throw new ApiError(404, "NOT_FOUND", "order not found");
    }

    const itemsResult = await pool.request()
      .input("orderId", sql.Int, orderId)
      .query(`
        SELECT oi.product_id, p.product_name, oi.quantity, oi.unit_price,
               (oi.quantity * oi.unit_price) AS subtotal
        FROM Order_Items oi
        JOIN Products p ON oi.product_id = p.product_id
        WHERE oi.order_id = @orderId
      `);

    return res.json({
      success: true,
      data: {
        ...order,
        items: itemsResult.recordset,
      },
    });
  })
);

// POST /orders — accepts cart items from the request body (frontend Zustand cart)
// This avoids the dependency on the Shopping_Cart table which the frontend doesn't use
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    const userId = req.user.userId;

    // Accept items from request body (sent by the frontend)
    const clientItems = req.body.items; // [{ product_id, quantity }]

    await transaction.begin();

    try {
      let items = [];

      if (clientItems && clientItems.length > 0) {
        // Frontend sent cart items directly — use them
        for (const ci of clientItems) {
          const productResult = await new sql.Request(transaction)
            .input("productId", sql.Int, ci.product_id)
            .query(`
              SELECT product_id, product_name, price, stock_quantity
              FROM Products
              WHERE product_id = @productId
            `);

          const product = productResult.recordset[0];
          if (!product) {
            throw new ApiError(404, "NOT_FOUND", `product ${ci.product_id} not found`);
          }

          items.push({
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            stock_quantity: product.stock_quantity,
            quantity: ci.quantity || 1,
          });
        }
      } else {
        // Fallback: try the Shopping_Cart table (legacy flow)
        const cartRows = await new sql.Request(transaction)
          .input("userId", sql.Int, userId)
          .query(`
            SELECT
              sc.cart_id, sc.product_id, sc.quantity,
              p.product_name, p.price, p.stock_quantity
            FROM Shopping_Cart sc
            JOIN Products p ON sc.product_id = p.product_id
            WHERE sc.user_id = @userId
          `);
        items = cartRows.recordset;
      }

      if (items.length === 0) {
        throw new ApiError(400, "VALIDATION_ERROR", "cart is empty");
      }

      // Validate stock
      for (const item of items) {
        if (item.quantity > item.stock_quantity) {
          throw new ApiError(
            409,
            "CONFLICT",
            `insufficient stock for product ${item.product_name}`
          );
        }
      }

      // Get delivery address
      const userResult = await new sql.Request(transaction)
        .input("userId", sql.Int, userId)
        .query("SELECT address FROM Users WHERE user_id = @userId");
      const userAddress = userResult.recordset[0]?.address;

      const deliveryAddress = req.body.delivery_address || userAddress;
      if (!deliveryAddress) {
        throw new ApiError(400, "VALIDATION_ERROR", "delivery_address is required", "delivery_address");
      }

      const paymentMethod = req.body.payment_method || "Cash on Delivery";
      let totalAmount = 0;
      items.forEach((item) => {
        totalAmount += item.quantity * Number(item.price);
      });

      // Create the order
      const orderResult = await new sql.Request(transaction)
        .input("userId", sql.Int, userId)
        .input("totalAmount", sql.Decimal(10, 2), totalAmount)
        .input("paymentMethod", sql.VarChar(50), paymentMethod)
        .input("deliveryAddress", sql.VarChar(255), deliveryAddress)
        .query(`
          INSERT INTO Orders (user_id, total_amount, payment_method, delivery_address, order_status)
          OUTPUT INSERTED.order_id, INSERTED.order_date, INSERTED.order_status
          VALUES (@userId, @totalAmount, @paymentMethod, @deliveryAddress, 'Pending')
        `);

      const order = orderResult.recordset[0];
      const orderId = order.order_id;

      // Insert order items & deduct stock
      for (const item of items) {
        await new sql.Request(transaction)
          .input("orderId", sql.Int, orderId)
          .input("productId", sql.Int, item.product_id)
          .input("quantity", sql.Int, item.quantity)
          .input("unitPrice", sql.Decimal(10, 2), item.price)
          .query(`
            INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)
            VALUES (@orderId, @productId, @quantity, @unitPrice)
          `);

        await new sql.Request(transaction)
          .input("productId", sql.Int, item.product_id)
          .input("quantity", sql.Int, item.quantity)
          .query(`
            UPDATE Products
            SET stock_quantity = stock_quantity - @quantity
            WHERE product_id = @productId
          `);
      }

      // Clean up Shopping_Cart if it was used
      await new sql.Request(transaction)
        .input("userId", sql.Int, userId)
        .query("DELETE FROM Shopping_Cart WHERE user_id = @userId");

      await transaction.commit();

      return res.status(201).json({
        success: true,
        data: {
          order_id: orderId,
          order_date: order.order_date,
          order_status: order.order_status,
          payment_method: paymentMethod,
          delivery_address: deliveryAddress,
          total_amount: Number(totalAmount.toFixed(2)),
          items: items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: Number(item.price),
            subtotal: Number((item.quantity * Number(item.price)).toFixed(2)),
          })),
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  })
);

module.exports = router;
