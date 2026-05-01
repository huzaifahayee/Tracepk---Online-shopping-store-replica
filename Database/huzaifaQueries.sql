USE OnlineClothingBrand;
GO

-- ============================================================
--  MEMBER 1: MUHAMMAD HUZAIFA (24L-3019)
--  Queries 1-10
-- ============================================================

-- Functionality 1: Register a New User
INSERT INTO Users (username, email, password_hash, full_name, phone_number, address)
VALUES ('huzaifaButRealThisTime', 'huzzzzz@madridista.com', '15_ucl_hehe', 'Muhammad Huzaifa hayee', '03001234567', 'House 12, Harbanspura, Lahore');

-- Functionality 2: Search Products by Name
SELECT product_id, product_name, price, size, color, stock_quantity
FROM Products
WHERE product_name LIKE '%shirt%'
ORDER BY price ASC;

-- Functionality 3: View All Orders for a Specific User
SELECT order_id, order_date, total_amount, payment_method, delivery_address, order_status
FROM Orders
WHERE user_id = 1
ORDER BY order_date DESC;

-- Functionality 4: Update Order Status
UPDATE Orders
SET order_status = 'Shipped'
WHERE order_id = 1;

-- Functionality 5: Total Revenue Per Category
SELECT c.category_name, SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM Categories c
JOIN Products p     ON c.category_id = p.category_id
JOIN Order_Items oi ON p.product_id  = oi.product_id
JOIN Orders o       ON oi.order_id   = o.order_id
GROUP BY c.category_name
ORDER BY total_revenue DESC;

-- Functionality 6: View Cart Items with Product Details
SELECT sc.cart_id, p.product_name, p.price, p.color, p.size, sc.quantity, (sc.quantity * p.price) AS subtotal
FROM Shopping_Cart sc
JOIN Products p ON sc.product_id = p.product_id
WHERE sc.user_id = 1;

-- Functionality 7: Top Selling Products
SELECT p.product_id, p.product_name, p.price, SUM(oi.quantity) AS total_units_sold
FROM Products p
JOIN Order_Items oi ON p.product_id = oi.product_id
JOIN Orders o       ON oi.order_id  = o.order_id
GROUP BY p.product_id, p.product_name, p.price
HAVING SUM(oi.quantity) > 5
ORDER BY total_units_sold DESC;

-- Functionality 8: Users Who Ordered But Have Empty Cart
SELECT user_id FROM Orders
EXCEPT
SELECT user_id FROM Shopping_Cart;

-- Functionality 9: Monthly Sales Report
SELECT
    YEAR(order_date)  AS sales_year,
    MONTH(order_date) AS sales_month,
    COUNT(order_id)   AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    MAX(total_amount) AS highest_order,
    MIN(total_amount) AS lowest_order
FROM Orders
GROUP BY YEAR(order_date), MONTH(order_date)
ORDER BY sales_year DESC, sales_month DESC;

-- Functionality 10: Products in Cart OR Previously Ordered
SELECT p.product_id, p.product_name, p.price, 'In Cart' AS source
FROM Products p
WHERE p.product_id IN (SELECT product_id FROM Shopping_Cart)
UNION
SELECT p.product_id, p.product_name, p.price, 'Ordered' AS source
FROM Products p
WHERE p.product_id IN (SELECT product_id FROM Order_Items);
