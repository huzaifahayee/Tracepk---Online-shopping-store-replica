USE OnlineClothingBrand;
GO

-- ============================================================
--  MEMBER 3: MUHAMMAD ABDULLAH RASHEED (24L-3002)
--  Queries 21-30
-- ============================================================

-- Functionality 21: Add a New Product to the Catalogue
INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
VALUES (3, 'Cargo Pants', 'Heavy-duty streetwear cargo trousers.', 3200.00, 60, 'L', 'Olive', 'cargo.jpg');

-- Functionality 22: Low Stock Alert
SELECT product_id, product_name, size, color, stock_quantity, price
FROM Products
WHERE stock_quantity < 20
ORDER BY stock_quantity ASC;

-- Functionality 23: Search Users by Name
SELECT user_id, username, full_name, email, phone_number, address
FROM Users
WHERE full_name LIKE '%Ahmed%';

-- Functionality 24: Update a User's Delivery Address
UPDATE Users
SET address = 'House 7, DHA Phase 5, Lahore'
WHERE user_id = 1;

-- Functionality 25: Cancel a Pending Order
DELETE FROM Orders
WHERE user_id  = 3
  AND order_id IN (
      SELECT order_id
      FROM   Orders
      WHERE  order_status = 'Pending'
        AND  user_id      = 3
  );

-- Functionality 26: Admin Dashboard - Active Order Queue
SELECT o.order_id, o.order_date, o.order_status, o.total_amount, o.delivery_address, u.full_name AS customer_name, u.email AS customer_email
FROM Orders o
LEFT JOIN Users u ON o.user_id = u.user_id
WHERE o.order_status = 'Pending'
UNION
SELECT o.order_id, o.order_date, o.order_status, o.total_amount, o.delivery_address, u.full_name, u.email
FROM Orders o
LEFT JOIN Users u ON o.user_id = u.user_id
WHERE o.order_status = 'Processing'
ORDER BY order_date ASC;

-- Functionality 27: Apply a Seasonal Discount to a Category
UPDATE Products
SET price = price * 0.85
WHERE category_id = (SELECT category_id FROM Categories WHERE category_name = 'Streetwear');

-- Functionality 28: Products Never Added to Any Cart
SELECT p.product_id, p.product_name, p.price, p.stock_quantity, p.size, p.color, c.category_name
FROM (SELECT product_id FROM Products EXCEPT SELECT product_id FROM Shopping_Cart) AS never_carted
RIGHT JOIN Products   p ON never_carted.product_id = p.product_id
JOIN       Categories c ON p.category_id           = c.category_id
WHERE never_carted.product_id IS NOT NULL;

-- Functionality 29: Payment Method Breakdown
SELECT payment_method, COUNT(order_id) AS total_orders, SUM(total_amount) AS total_revenue, AVG(total_amount) AS avg_order_value, MIN(total_amount) AS smallest_order, MAX(total_amount) AS largest_order
FROM Orders
WHERE order_status <> 'Cancelled'
GROUP BY payment_method
HAVING COUNT(order_id) >= 1
ORDER BY total_revenue DESC;

-- Functionality 30: Cross-Category Shoppers
SELECT u.user_id, u.username, u.full_name, u.email, u.phone_number, COUNT(DISTINCT o.order_id) AS total_orders
FROM   Users  u
JOIN   Orders o ON u.user_id = o.user_id
WHERE  u.user_id IN (
    SELECT o1.user_id FROM Orders o1 JOIN Order_Items oi1 ON o1.order_id = oi1.order_id JOIN Products p1 ON oi1.product_id = p1.product_id JOIN Categories c1 ON p1.category_id = c1.category_id WHERE c1.category_name = 'Streetwear'
    INTERSECT
    SELECT o2.user_id FROM Orders o2 JOIN Order_Items oi2 ON o2.order_id = oi2.order_id JOIN Products p2 ON oi2.product_id = p2.product_id JOIN Categories c2 ON p2.category_id = c2.category_id WHERE c2.category_name <> 'Streetwear'
)
GROUP BY u.user_id, u.username, u.full_name, u.email, u.phone_number
ORDER BY total_orders DESC;
