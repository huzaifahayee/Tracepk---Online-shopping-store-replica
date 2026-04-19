const express = require("express");
const { getPool, sql } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

router.get(
  "/me",
  requireAdminAuth,
  asyncHandler(async (_req, res) => {
    return res.json({
      success: true,
      data: { message: "Admin session is valid" },
    });
  })
);

// GET /api/admin/orders — list all orders for admin dashboard
router.get(
  "/orders",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        o.order_id,
        o.order_date,
        o.order_status,
        o.payment_method,
        o.delivery_address,
        o.total_amount,
        u.full_name AS customer_name,
        u.email AS customer_email,
        (SELECT COUNT(*) FROM Order_Items oi WHERE oi.order_id = o.order_id) AS item_count
      FROM Orders o
      JOIN Users u ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
    `);

    return res.json({ success: true, data: result.recordset });
  })
);

// PUT /api/admin/orders/:id/status — update order status
router.put(
  "/orders/:id/status",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
    }

    const pool = await getPool();
    await pool.request()
      .input("orderId", sql.Int, orderId)
      .input("status", sql.VarChar(50), status)
      .query("UPDATE Orders SET order_status = @status WHERE order_id = @orderId");

    return res.json({ success: true, message: "Order status updated" });
  })
);

// GET /api/admin/customers — list all customers with their total spent
router.get(
  "/customers",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        u.user_id as id,
        u.full_name as name,
        u.email,
        u.phone_number as phone,
        u.registration_date as joined,
        COUNT(o.order_id) as orders,
        ISNULL(SUM(o.total_amount), 0) as spent
      FROM Users u
      LEFT JOIN Orders o ON u.user_id = o.user_id
      GROUP BY u.user_id, u.full_name, u.email, u.phone_number, u.registration_date
      ORDER BY u.registration_date DESC
    `);

    return res.json({ success: true, data: result.recordset });
  })
);

module.exports = router;
