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
    const { status, search, date } = req.query;
    const pool = await getPool();
    
    let query = `
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
      WHERE 1=1
    `;

    const request = pool.request();

    if (status && status !== 'All') {
      query += ` AND o.order_status = @status`;
      request.input('status', sql.VarChar(50), status);
    }

    if (search) {
      query += ` AND (u.full_name LIKE @search OR u.email LIKE @search OR CAST(o.order_id AS VARCHAR) LIKE @search)`;
      request.input('search', sql.VarChar(100), `%${search}%`);
    }

    if (date) {
      query += ` AND CAST(o.order_date AS DATE) = @date`;
      request.input('date', sql.Date, date);
    }

    query += ` ORDER BY o.order_date DESC`;

    const result = await request.query(query);

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

// GET /api/admin/dashboard — admin dashboard analytics
router.get(
  "/dashboard",
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    
    const usersCount = await pool.request().query("SELECT COUNT(*) as count FROM Users");
    const ordersCount = await pool.request().query("SELECT COUNT(*) as count FROM Orders");
    const revenueSum = await pool.request().query("SELECT ISNULL(SUM(total_amount), 0) as total FROM Orders");
    const pendingCount = await pool.request().query("SELECT COUNT(*) as count FROM Orders WHERE order_status = 'Pending'");
    const activeProducts = await pool.request().query("SELECT COUNT(*) as count FROM Products");
    
    const recentOrders = await pool.request().query(`
      SELECT TOP 5
        o.order_id,
        o.order_date,
        o.order_status,
        o.total_amount,
        u.full_name AS customer_name
      FROM Orders o
      JOIN Users u ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
    `);
    
    const statusData = await pool.request().query(`
      SELECT order_status as name, COUNT(*) as value
      FROM Orders
      GROUP BY order_status
    `);
    
    const revenueData = await pool.request().query(`
      SELECT 
        CAST(order_date AS DATE) as date_val, 
        SUM(total_amount) as revenue,
        COUNT(order_id) as orders
      FROM Orders
      WHERE order_date >= DATEADD(day, -30, GETDATE())
      GROUP BY CAST(order_date AS DATE)
      ORDER BY date_val ASC
    `);

    const formattedRevenue = revenueData.recordset.map(r => {
      const d = new Date(r.date_val);
      const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        day: dayStr,
        revenue: r.revenue,
        orders: r.orders
      };
    });

    const topProductsResult = await pool.request().query(`
      SELECT TOP 5
        p.product_name as name,
        SUM(oi.quantity) as sales
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.product_id
      GROUP BY p.product_id, p.product_name
      ORDER BY sales DESC
    `);

    const categoryRevenueResult = await pool.request().query(`
      SELECT 
        c.category_name as name,
        SUM(oi.quantity * oi.unit_price) as value
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.product_id
      JOIN Categories c ON p.category_id = c.category_id
      GROUP BY c.category_id, c.category_name
      ORDER BY value DESC
    `);

    return res.json({
      success: true,
      data: {
        totalUsers: usersCount.recordset[0].count,
        totalOrders: ordersCount.recordset[0].count,
        totalRevenue: revenueSum.recordset[0].total,
        pendingOrders: pendingCount.recordset[0].count,
        activeProducts: activeProducts.recordset[0].count,
        recentOrders: recentOrders.recordset,
        orderStatusData: statusData.recordset,
        revenueData: formattedRevenue,
        topProducts: topProductsResult.recordset,
        revenueByCategory: categoryRevenueResult.recordset
      }
    });
  })
);

module.exports = router;
