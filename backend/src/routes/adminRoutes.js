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

// ── Admin Users ──

// GET /api/admin/users — list users with optional search + disabled flag
router.get(
  "/users",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || "").trim();
    const pool = await getPool();
    const result = await pool
      .request()
      .input("search", sql.VarChar(150), `%${search}%`)
      .query(`
        SELECT
          u.user_id,
          u.username,
          u.email,
          u.full_name,
          u.phone_number,
          u.address,
          u.registration_date,
          ISNULL(u.is_disabled, 0) AS is_disabled,
          COUNT(o.order_id) AS order_count,
          ISNULL(SUM(o.total_amount), 0) AS total_spent
        FROM Users u
        LEFT JOIN Orders o ON u.user_id = o.user_id
        WHERE (u.full_name LIKE @search
           OR u.email LIKE @search
           OR u.username LIKE @search)
        GROUP BY u.user_id, u.username, u.email, u.full_name,
                 u.phone_number, u.address, u.registration_date, u.is_disabled
        ORDER BY u.registration_date DESC
      `);

    return res.json({ success: true, data: result.recordset });
  })
);

// PUT /api/admin/users/:id/disable — toggle soft-disable
router.put(
  "/users/:id/disable",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid user ID" },
      });
    }

    const pool = await getPool();

    // Get current state
    const current = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT is_disabled FROM Users WHERE user_id = @userId");

    if (current.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      });
    }

    const newState = current.recordset[0].is_disabled ? 0 : 1;
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("disabled", sql.Bit, newState)
      .query("UPDATE Users SET is_disabled = @disabled WHERE user_id = @userId");

    return res.json({
      success: true,
      data: { user_id: userId, is_disabled: !!newState },
    });
  })
);

// DELETE /api/admin/users/:id — hard delete only if user has zero orders
router.delete(
  "/users/:id",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid user ID" },
      });
    }

    const pool = await getPool();

    // Safety: block if user has any orders (financial data)
    const orderCheck = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT COUNT(*) AS cnt FROM Orders WHERE user_id = @userId");

    if (orderCheck.recordset[0].cnt > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message:
            "Cannot delete user with existing orders. Use disable instead to preserve order history.",
        },
      });
    }

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("DELETE FROM Users WHERE user_id = @userId");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      });
    }

    return res.json({ success: true, data: { deleted: true } });
  })
);

// ── Admin Dashboard ──

// GET /api/admin/dashboard — aggregated analytics
router.get(
  "/dashboard",
  requireAdminAuth,
  asyncHandler(async (_req, res) => {
    const pool = await getPool();

    // KPI counts
    const kpis = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Users) AS total_users,
        (SELECT COUNT(*) FROM Orders) AS total_orders,
        (SELECT ISNULL(SUM(total_amount), 0) FROM Orders WHERE order_status <> 'Cancelled') AS total_revenue,
        (SELECT COUNT(*) FROM Orders WHERE order_status = 'Pending') AS pending_orders
    `);

    // Recent orders (last 10)
    const recentOrders = await pool.request().query(`
      SELECT TOP 10
        o.order_id,
        o.order_date,
        o.order_status,
        o.total_amount,
        u.full_name AS customer_name,
        u.email AS customer_email
      FROM Orders o
      JOIN Users u ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
    `);

    // Top 5 products by units sold
    const topProducts = await pool.request().query(`
      SELECT TOP 5
        p.product_id,
        p.product_name,
        COALESCE(SUM(oi.quantity), 0) AS units_sold,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
      FROM Products p
      LEFT JOIN Order_Items oi ON p.product_id = oi.product_id
      GROUP BY p.product_id, p.product_name
      ORDER BY units_sold DESC
    `);

    // Revenue by category
    const revenueByCategory = await pool.request().query(`
      SELECT
        c.category_name,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
      FROM Categories c
      LEFT JOIN Products p ON c.category_id = p.category_id
      LEFT JOIN Order_Items oi ON p.product_id = oi.product_id
      GROUP BY c.category_name
      ORDER BY revenue DESC
    `);

    // Revenue over time (daily, last 30 days)
    const revenueOverTime = await pool.request().query(`
      SELECT
        CAST(o.order_date AS DATE) AS order_day,
        COUNT(o.order_id) AS orders_count,
        SUM(o.total_amount) AS daily_revenue
      FROM Orders o
      WHERE o.order_status <> 'Cancelled'
        AND o.order_date >= DATEADD(DAY, -30, GETDATE())
      GROUP BY CAST(o.order_date AS DATE)
      ORDER BY order_day ASC
    `);

    // Order status breakdown
    const orderStatusBreakdown = await pool.request().query(`
      SELECT
        order_status AS name,
        COUNT(*) AS value
      FROM Orders
      GROUP BY order_status
    `);

    return res.json({
      success: true,
      data: {
        ...kpis.recordset[0],
        recent_orders: recentOrders.recordset,
        top_products: topProducts.recordset,
        revenue_by_category: revenueByCategory.recordset,
        revenue_over_time: revenueOverTime.recordset,
        order_status_breakdown: orderStatusBreakdown.recordset,
      },
    });
  })
);

module.exports = router;

