USE OnlineClothingBrand;
GO

-- ============================================================
--  MEMBER 2: SYED SAAD ALI (24L-2549)
--  Queries 11-20
-- ============================================================

-- Functionality 11: Categories With Product Count
SELECT
    c.category_id,
    c.category_name,
    c.description       AS category_description,
    COUNT(p.product_id) AS total_products
FROM Categories c
LEFT JOIN Products p ON c.category_id = p.category_id
GROUP BY c.category_id, c.category_name, c.description
ORDER BY total_products DESC;

-- Functionality 12: Product Price-Tier Labels
SELECT
    product_id,
    product_name,
    size,
    color,
    price,
    stock_quantity,
    CASE
        WHEN price < 500                THEN 'Budget'
        WHEN price BETWEEN 500 AND 1500 THEN 'Mid-Range'
        ELSE                                 'Premium'
    END AS price_tier
FROM Products
ORDER BY price ASC;

-- Functionality 13: Inactive Users (Never Placed an Order)
SELECT
    u.user_id,
    u.username,
    u.full_name,
    u.email,
    u.phone_number,
    u.registration_date
FROM Users u
LEFT JOIN Orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL
ORDER BY u.registration_date ASC;

-- Functionality 14: Engaged Customers (Cart AND Order History)
SELECT
    u.user_id,
    u.username,
    u.full_name,
    u.email
FROM Users u
WHERE u.user_id IN (
    SELECT user_id FROM Orders
    INTERSECT
    SELECT user_id FROM Shopping_Cart
);

-- Functionality 15: Full Product Sales Summary (Including Unsold)
SELECT
    p.product_id,
    p.product_name,
    p.price,
    p.stock_quantity,
    COUNT(oi.order_item_id)                          AS times_ordered,
    COALESCE(SUM(oi.quantity), 0)                    AS total_units_sold,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0.00) AS total_revenue
FROM Order_Items oi
RIGHT JOIN Products p ON oi.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.price, p.stock_quantity
ORDER BY total_revenue DESC;

-- Functionality 16: Complete User-Order Bridge
SELECT
    u.user_id,
    u.username,
    u.full_name,
    o.order_id,
    o.order_date,
    o.total_amount,
    o.order_status,
    CASE
        WHEN u.user_id  IS NULL THEN 'Orphan Order'
        WHEN o.order_id IS NULL THEN 'No Orders Yet'
        ELSE                        'Has Orders'
    END AS account_status
FROM Users u
FULL OUTER JOIN Orders o ON u.user_id = o.user_id
ORDER BY u.user_id, o.order_date DESC;

-- Functionality 17: Customer Spending Rank
WITH CustomerLifetimeValue AS (
    SELECT
        u.user_id,
        u.username,
        u.full_name,
        u.email,
        COUNT(DISTINCT o.order_id) AS total_orders,
        SUM(o.total_amount)        AS lifetime_spend
    FROM Users u
    JOIN Orders o ON u.user_id = o.user_id
    GROUP BY u.user_id, u.username, u.full_name, u.email
)
SELECT
    user_id,
    username,
    full_name,
    email,
    total_orders,
    lifetime_spend,
    RANK() OVER (ORDER BY lifetime_spend DESC) AS spending_rank
FROM CustomerLifetimeValue
ORDER BY spending_rank;

-- Functionality 18: Best-Selling Product Per Category
WITH ProductSales AS (
    SELECT
        p.product_id,
        p.product_name,
        p.category_id,
        COALESCE(SUM(oi.quantity), 0) AS units_sold
    FROM Products p
    LEFT JOIN Order_Items oi ON p.product_id = oi.product_id
    GROUP BY p.product_id, p.product_name, p.category_id
),
RankedProducts AS (
    SELECT
        ps.product_id,
        ps.product_name,
        ps.units_sold,
        c.category_name,
        RANK() OVER (
            PARTITION BY ps.category_id
            ORDER BY ps.units_sold DESC
        ) AS rank_in_category
    FROM ProductSales ps
    JOIN Categories c ON ps.category_id = c.category_id
)
SELECT
    category_name,
    product_id,
    product_name,
    units_sold       AS best_seller_units_sold,
    rank_in_category
FROM RankedProducts
WHERE rank_in_category = 1
ORDER BY best_seller_units_sold DESC;

-- Functionality 19: Running Cumulative Revenue by Date
SELECT
    CAST(order_date AS DATE) AS order_day,
    COUNT(order_id)          AS orders_that_day,
    SUM(total_amount)        AS daily_revenue,
    SUM(SUM(total_amount)) OVER (
        ORDER BY CAST(order_date AS DATE)
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    )                        AS running_total_revenue
FROM Orders
WHERE order_status <> 'Cancelled'
GROUP BY CAST(order_date AS DATE)
ORDER BY order_day;

-- Functionality 20: Inventory Health Report
WITH ProductActivity AS (
    SELECT
        p.product_id,
        p.product_name,
        p.price,
        p.stock_quantity,
        c.category_name,
        CASE WHEN sc.product_id IS NOT NULL THEN 'Yes' ELSE 'No' END AS is_in_cart,
        CASE WHEN oi.product_id IS NOT NULL THEN 'Yes' ELSE 'No' END AS is_ever_ordered
    FROM Products p
    JOIN Categories c ON p.category_id = c.category_id
    LEFT JOIN (SELECT DISTINCT product_id FROM Shopping_Cart) sc ON p.product_id = sc.product_id
    LEFT JOIN (SELECT DISTINCT product_id FROM Order_Items)   oi ON p.product_id = oi.product_id
)
SELECT
    pa.product_id,
    pa.product_name,
    pa.category_name,
    pa.price,
    pa.stock_quantity,
    pa.is_in_cart,
    pa.is_ever_ordered,
    CASE
        WHEN pa.product_id IN (SELECT product_id FROM Shopping_Cart INTERSECT SELECT product_id FROM Order_Items) THEN 'Yes' ELSE 'No'
    END AS is_proven_winner,
    CASE
        WHEN pa.stock_quantity = 0                                    THEN 'Out of Stock'
        WHEN pa.stock_quantity < 10                                   THEN 'Low Stock'
        WHEN pa.is_ever_ordered = 'No' AND pa.is_in_cart = 'No'      THEN 'Dead Stock'
        WHEN pa.stock_quantity >= 50   AND pa.is_ever_ordered = 'Yes' THEN 'Well Stocked'
        ELSE                                                               'Healthy'
    END AS stock_health
FROM ProductActivity pa
ORDER BY pa.stock_quantity ASC;
