-- ============================================================
--  DB LAB - PROJECT PHASE 2
--  Online Clothing Brand E-Commerce Web Application
--  Batch 24 | BS-SE 4B
--  Group 2
--  Member 1: Muhammad Huzaifa    (24L-3019)  -- Queries 1-10
--  Member 2: Syed Saad Ali       (24L-2549)  -- Queries 11-20
--  Member 3: Muhammad Abdullah   (24L-3002)  -- Queries 21-30
--  Instructor: Mr. Nauman Hanif
--  FAST NUCES Lahore
-- ============================================================


-- ============================================================
--  PHASE 1 - DATABASE & TABLE CREATION
-- ============================================================

CREATE DATABASE OnlineClothingBrand;
USE OnlineClothingBrand;

CREATE TABLE Users (
    user_id           INT IDENTITY(1,1) PRIMARY KEY,
    username          VARCHAR(50)  NOT NULL UNIQUE,
    email             VARCHAR(100) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    full_name         VARCHAR(100) NOT NULL,
    phone_number      VARCHAR(20),
    address           VARCHAR(255),
    registration_date DATETIME DEFAULT GETDATE()
);

CREATE TABLE Admins (
    admin_id      INT IDENTITY(1,1) PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    last_login    DATETIME
);

CREATE TABLE Categories (
    category_id   INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description   VARCHAR(255)
);

CREATE TABLE Products (
    product_id     INT IDENTITY(1,1) PRIMARY KEY,
    category_id    INT NOT NULL,
    product_name   VARCHAR(150) NOT NULL,
    description    VARCHAR(500),
    price          DECIMAL(10,2) NOT NULL CHECK (price > 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    size           VARCHAR(20),
    color          VARCHAR(50),
    image_url      VARCHAR(255),
    date_added     DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Products_Categories
        FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        ON DELETE CASCADE
);

CREATE TABLE Orders (
    order_id         INT IDENTITY(1,1) PRIMARY KEY,
    user_id          INT NOT NULL,
    order_date       DATETIME DEFAULT GETDATE(),
    total_amount     DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method   VARCHAR(50) DEFAULT 'Cash on Delivery',
    delivery_address VARCHAR(255) NOT NULL,
    order_status     VARCHAR(20) DEFAULT 'Pending'
        CHECK (order_status IN ('Pending','Processing','Shipped','Delivered','Cancelled')),
    CONSTRAINT FK_Orders_Users
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE Order_Items (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id      INT NOT NULL,
    product_id    INT NOT NULL,
    quantity      INT NOT NULL CHECK (quantity > 0),
    unit_price    DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
    CONSTRAINT FK_OrderItems_Orders
        FOREIGN KEY (order_id) REFERENCES Orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

CREATE TABLE Shopping_Cart (
    cart_id    INT IDENTITY(1,1) PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL CHECK (quantity > 0),
    date_added DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Cart_Users
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT FK_Cart_Products
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
);


-- ============================================================
--  SAMPLE DATA
-- ============================================================

INSERT INTO Categories (category_name, description) VALUES
('Research Chemicals', 'Items for the bold and the curious.'),
('Personal Care',      'Grooming and maintenance.'),
('Streetwear',         'Clothing for the urban explorer.');

INSERT INTO Users (username, email, password_hash, full_name, phone_number, address) VALUES
('Saad_The_Cook',  'saad@example.com',     'hash_12345', 'Saad Ahmed',      '555-0101', '123 Breaking Bad Lane'),
('huZaifa_Beard',  'huzaifa@example.com',  'hash_67890', 'Huzaifa Hayee',   '555-0202', '456 Follicle Ave'),
('Abdullah_Flex',  'abdullah@example.com', 'hash_abcde', 'Abdullah Sheikh', '555-0303', '789 Gains Blvd');

INSERT INTO Admins (username, password_hash, full_name, email) VALUES
('Big_Boss', 'admin_hash_99', 'The Overseer', 'admin@store.com');

INSERT INTO Products (category_id, product_name, description, price, stock_quantity) VALUES
(1, 'Blue Sky',       'I did it, because I was good at it.', 50.00,   100),
(2, 'Minoxidil',      'Unc use it.',                         20.00,    50),
(1, 'Pure Caffeine',  'Mids be driving me crazy.',           15.00,   200);

-- Orders
INSERT INTO Orders (user_id, total_amount, delivery_address, order_status)
VALUES (1, 65.00, '123 Breaking Bad Lane', 'Processing');

INSERT INTO Orders (user_id, total_amount, delivery_address, order_status)
VALUES (2, 20.00, '456 Follicle Ave', 'Shipped');

-- Order Items
INSERT INTO Order_Items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 50.00),
(1, 3, 1, 15.00);

INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)
VALUES (2, 2, 1, 20.00);

-- Shopping Cart
INSERT INTO Shopping_Cart (user_id, product_id, quantity) VALUES (3, 3, 5);
INSERT INTO Shopping_Cart (user_id, product_id, quantity) VALUES (1, 1, 2);

-- Extra product + order for HAVING > 5 demo
INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
VALUES (1, 'Men Cotton Shirt', 'Casual everyday shirt', 1200.00, 100, 'M', 'White', 'shirt.jpg');

INSERT INTO Orders (user_id, order_date, total_amount, payment_method, delivery_address, order_status)
VALUES (1, '2026-03-01', 7200.00, 'Cash on Delivery', 'House 5, Model Town, Lahore', 'Delivered');

INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)
VALUES (3, 4, 6, 1200.00);

-- Extra product for Streetwear discount demo
INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
VALUES (3, 'Cargo Pants', 'Heavy-duty streetwear cargo trousers.', 3200.00, 60, 'L', 'Olive', 'cargo.jpg');


-- ============================================================
--  PHASE 2 - FUNCTIONALITIES
-- ============================================================


-- ============================================================
--  MEMBER 1: MUHAMMAD HUZAIFA (24L-3019)
--  Queries 1-10
-- ============================================================






-- ------------------------------------------------------------
-- Functionality 1: Register a New User
-- Concepts: INSERT
-- Description:
--   Adds a new customer account into the Users table.

-- ------------------------------------------------------------

INSERT INTO Users (username, email, password_hash, full_name, phone_number, address)
VALUES (
    'huzaifaButRealThisTime',
    'huzzzzz@madridista.com',
    '15_ucl_hehe',
    'Muhammad Huzaifa hayee',
    '03001234567',
    'House 12, Harbanspura, Lahore'
);
SELECT * FROM Users;


-- ------------------------------------------------------------
-- Functionality 2: Search Products by Name
-- Concepts: SELECT, WHERE, LIKE, ORDER BY
-- Description:
--   Allows a customer to search for products by typing a
--   partial keyword (e.g. "shirt"). 
-- ------------------------------------------------------------

INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
VALUES (1, 'Cotton T-Shirt', 'Casual wear', 999.00, 50, 'M', 'White', 'tshirt.jpg');

SELECT product_id, product_name, price, size, color, stock_quantity
FROM Products
WHERE product_name LIKE '%shirt%'
ORDER BY price ASC;


-- ------------------------------------------------------------
-- Functionality 3: View All Orders for a Specific User
-- Concepts: SELECT, WHERE, ORDER BY
-- Description:
--   Fetches the complete order history for a given customer
--   identified by user_id. 
-- ------------------------------------------------------------

SELECT order_id, order_date, total_amount, payment_method,
       delivery_address, order_status
FROM Orders
WHERE user_id = 1
ORDER BY order_date DESC;


-- ------------------------------------------------------------
-- Functionality 4: Update Order Status
-- Concepts: UPDATE, WHERE
-- Description:
--   Allows an admin to change the status of a specific order.
--   Order progresses: Pending -> Processing -> Shipped ->
--   Delivered. 
-- ------------------------------------------------------------

UPDATE Orders
SET order_status = 'Shipped'
WHERE order_id = 1;

SELECT * FROM Orders WHERE order_id = 1;


-- ------------------------------------------------------------
-- Functionality 5: Total Revenue Per Category
-- Concepts: JOIN, GROUP BY, SUM, ORDER BY
-- Description:
--   Calculates total revenue generated from each product
--   category. Joins four tables and computes revenue as
--   quantity * unit_price per line item, then sums per
--   category. Highest earning category shown first.
-- ------------------------------------------------------------

SELECT c.category_name,
       SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM Categories c
JOIN Products p     ON c.category_id = p.category_id
JOIN Order_Items oi ON p.product_id  = oi.product_id
JOIN Orders o       ON oi.order_id   = o.order_id
GROUP BY c.category_name
ORDER BY total_revenue DESC;


-- ------------------------------------------------------------
-- Functionality 6: View Cart Items with Product Details
-- Concepts: SELECT, JOIN, WHERE
-- Description:
--   Retrieves all items in a specific user's shopping cart
--   joined with full product details. Also calculates a
--   subtotal per line item.
-- ------------------------------------------------------------

SELECT sc.cart_id,
       p.product_name,
       p.price,
       p.color,
       p.size,
       sc.quantity,
       (sc.quantity * p.price) AS subtotal
FROM Shopping_Cart sc
JOIN Products p ON sc.product_id = p.product_id
WHERE sc.user_id = 1;


-- ------------------------------------------------------------
-- Functionality 7: Top Selling Products
-- Concepts: JOIN, GROUP BY, SUM, HAVING, ORDER BY
-- Description:
--   Finds products that have sold more than 5 units total
--   across all orders. HAVING filters on aggregated results
--   unlike WHERE which filters rows.
-- ------------------------------------------------------------

SELECT p.product_id,
       p.product_name,
       p.price,
       SUM(oi.quantity) AS total_units_sold
FROM Products p
JOIN Order_Items oi ON p.product_id = oi.product_id
JOIN Orders o       ON oi.order_id  = o.order_id
GROUP BY p.product_id, p.product_name, p.price
HAVING SUM(oi.quantity) > 5
ORDER BY total_units_sold DESC;


-- ------------------------------------------------------------
-- Functionality 8: Users Who Ordered But Have Empty Cart
-- Concepts: EXCEPT, Subquery
-- Description:
--   Uses EXCEPT to find users who appear in Orders (placed
--   at least one order) but NOT in Shopping_Cart (no items
--   in cart currently)..
-- ------------------------------------------------------------

SELECT user_id FROM Orders
EXCEPT
SELECT user_id FROM Shopping_Cart;


-- ------------------------------------------------------------
-- Functionality 9: Monthly Sales Report
-- Concepts: GROUP BY, COUNT, SUM, AVG, MAX, MIN, ORDER BY
-- Description:
--   Generates a month-by-month sales breakdown showing
--   total orders, revenue, average order value, highest
--   and lowest order per month. Used in admin analytics
--   dashboard. 
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 10: Products in Cart OR Previously Ordered
-- Concepts: UNION, Subquery, SELECT
-- Description:
--   Combines two result sets using UNION to produce a single
--   list of all "active" products — those in any user's cart
--   OR that have appeared in a past order.
-- ------------------------------------------------------------

SELECT p.product_id, p.product_name, p.price, 'In Cart' AS source
FROM Products p
WHERE p.product_id IN (SELECT product_id FROM Shopping_Cart)

UNION

SELECT p.product_id, p.product_name, p.price, 'Ordered' AS source
FROM Products p
WHERE p.product_id IN (SELECT product_id FROM Order_Items);


-- ============================================================
--  MEMBER 2: SYED SAAD ALI (24L-2549)
--  Queries 11-20
-- ============================================================


-- ------------------------------------------------------------
-- Functionality 11: Categories With Product Count
-- Concepts: LEFT JOIN, COUNT, GROUP BY, ORDER BY
-- Description:
--   Lists every category alongside how many products belong
--   to it. Categories with NO products still appear with a
--   count of 0 — only possible with LEFT JOIN since INNER
--   JOIN would silently drop them.
-- ------------------------------------------------------------

SELECT
    c.category_id,
    c.category_name,
    c.description       AS category_description,
    COUNT(p.product_id) AS total_products
FROM Categories c
LEFT JOIN Products p ON c.category_id = p.category_id
GROUP BY c.category_id, c.category_name, c.description
ORDER BY total_products DESC;


-- ------------------------------------------------------------
-- Functionality 12: Product Price-Tier Labels
-- Concepts: SELECT, CASE WHEN, ORDER BY
-- Description:
--   Stamps every product with a human-readable price tier
--   (Budget, Mid-Range, or Premium) using a CASE expression.
--   Useful for front-end filter badges and discount
--   targeting.
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 13: Inactive Users (Never Placed an Order)
-- Concepts: LEFT JOIN, WHERE (IS NULL filter)
-- Description:
--   Retrieves all registered users who have never placed an
--   order. LEFT JOIN keeps every user row; rows where no
--   matching Orders record exists will have NULL in order_id
--   which the WHERE clause filters for.
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 14: Engaged Customers (Cart AND Order History)
-- Concepts: INTERSECT, Subquery
-- Description:
--   Uses INTERSECT to find user IDs that appear in BOTH
--   Orders (have purchased before) AND Shopping_Cart (are
--   currently browsing). These are high-intent re-engaging
--   customers — ideal targets for loyalty perks.
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 15: Full Product Sales Summary (Including Unsold)
-- Concepts: RIGHT JOIN, SUM, COUNT, GROUP BY, ORDER BY
-- Description:
--   Produces a sales summary for EVERY product by placing
--   Products on the right side of the join. Items never
--   ordered appear with 0 values, immediately flagging
--   dead stock.
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 16: Complete User-Order Bridge
-- Concepts: FULL OUTER JOIN, CASE WHEN, ORDER BY
-- Description:
--   Merges Users and Orders with FULL OUTER JOIN so users
--   with no orders and orders with no matching user both
--   appear. A CASE expression labels each row as Has Orders,
--   No Orders Yet, or Orphan Order for CRM audits.
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 17: Customer Spending Rank
-- Concepts: CTE (WITH), JOIN, SUM, COUNT, RANK(), ORDER BY
-- Description:
--   A CTE aggregates every user's total spend and order
--   count. Then RANK() assigns a leaderboard position
--   ordered by lifetime spend so marketing can quickly
--   identify VIP customers.
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 18: Best-Selling Product Per Category
-- Concepts: CTE (WITH), LEFT JOIN, SUM, GROUP BY,
--           RANK() OVER PARTITION BY
-- Description:
--   First CTE computes total units sold per product. Second
--   CTE applies RANK() partitioned by category so each
--   category gets its own rank-1 winner. Outer query filters
--   for rank = 1, returning the best-seller per category.
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 19: Running Cumulative Revenue by Date
-- Concepts: GROUP BY, SUM aggregate, SUM() OVER window
--           function, CAST, ORDER BY
-- Description:
--   Groups non-cancelled orders by calendar date and
--   computes daily revenue plus a running cumulative total
--   using SUM() OVER with UNBOUNDED PRECEDING. Makes it
--   easy to plot a revenue growth curve over time.
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- Functionality 20: Inventory Health Report
-- Concepts: CTE (WITH), LEFT JOIN, INTERSECT, CASE WHEN
-- Description:
--   Builds a full inventory health card for every product
--   combining four signals: stock level, whether it is in
--   any cart, whether it has been ordered, and whether it
--   is a proven winner (INTERSECT finds products in BOTH
--   carts AND orders). Labels each product's stock health.
-- ------------------------------------------------------------

WITH ProductActivity AS (
    SELECT
        p.product_id,
        p.product_name,
        p.price,
        p.stock_quantity,
        p.size,
        p.color,
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
    pa.size,
    pa.color,
    pa.is_in_cart,
    pa.is_ever_ordered,
    CASE
        WHEN pa.product_id IN (
            SELECT product_id FROM Shopping_Cart
            INTERSECT
            SELECT product_id FROM Order_Items
        ) THEN 'Yes' ELSE 'No'
    END AS is_proven_winner,
    CASE
        WHEN pa.stock_quantity = 0                                    THEN 'Out of Stock'
        WHEN pa.stock_quantity < 10                                   THEN 'Low Stock'
        WHEN pa.is_ever_ordered = 'No' AND pa.is_in_cart = 'No'      THEN 'Dead Stock'
        WHEN pa.stock_quantity >= 50   AND pa.is_ever_ordered = 'Yes' THEN 'Well Stocked'
        ELSE                                                               'Healthy'
    END AS stock_health
FROM ProductActivity pa
ORDER BY
    CASE pa.stock_quantity WHEN 0 THEN 0 ELSE 1 END,
    pa.stock_quantity ASC;


-- ============================================================
--  MEMBER 3: MUHAMMAD ABDULLAH RASHEED (24L-3002)
--  Queries 21-30
-- ============================================================


-- ------------------------------------------------------------
-- Functionality 21: Add a New Product to the Catalogue
-- Concepts: INSERT
-- Description:
--   An admin lists a brand-new clothing item in the store
--   by inserting a full product record into the Products
--   table. A follow-up SELECT confirms the entry was saved.
-- ------------------------------------------------------------

INSERT INTO Products
    (category_id, product_name, description, price, stock_quantity, size, color, image_url)
VALUES
    (3, 'Cargo Pants', 'Heavy-duty streetwear cargo trousers.', 3200.00, 60, 'L', 'Olive', 'cargo.jpg');

SELECT * FROM Products WHERE product_name = 'Cargo Pants';


-- ------------------------------------------------------------
-- Functionality 22: Low Stock Alert
-- Concepts: SELECT, WHERE, ORDER BY
-- Description:
--   Returns every product whose stock has dropped below
--   20 units, sorted from most critical upward. The store
--   manager uses this daily to trigger restocking before
--   items go out of stock completely.
-- ------------------------------------------------------------

UPDATE Products SET stock_quantity = 15 WHERE product_id = 1;

SELECT
    product_id,
    product_name,
    size,
    color,
    stock_quantity,
    price
FROM Products
WHERE stock_quantity < 20
ORDER BY stock_quantity ASC;


-- ------------------------------------------------------------
-- Functionality 23: Search Users by Name
-- Concepts: SELECT, WHERE, LIKE
-- Description:
--   Allows an admin to look up a customer account by typing
--   a partial name. Useful for customer support when an
--   agent only knows part of the customer's name.
-- ------------------------------------------------------------

SELECT
    user_id,
    username,
    full_name,
    email,
    phone_number,
    address
FROM Users
WHERE full_name LIKE '%Ahmed%';


-- ------------------------------------------------------------
-- Functionality 24: Update a User's Delivery Address
-- Concepts: UPDATE, WHERE
-- Description:
--   Lets a logged-in customer update their saved delivery
--   address from their profile page. A follow-up SELECT
--   confirms the change was applied correctly.
-- ------------------------------------------------------------

UPDATE Users
SET address = 'House 7, DHA Phase 5, Lahore'
WHERE user_id = 1;

SELECT user_id, username, full_name, address
FROM Users
WHERE user_id = 1;


-- ------------------------------------------------------------
-- Functionality 25: Cancel a Pending Order
-- Concepts: DELETE, WHERE, Subquery
-- Description:
--   Removes a Pending order placed by a specific user.
--   The subquery ensures only orders genuinely in Pending
--   status are targeted, preventing accidental deletion of
--   orders already being processed or shipped.
-- ------------------------------------------------------------

DELETE FROM Orders
WHERE user_id  = 3
  AND order_id IN (
      SELECT order_id
      FROM   Orders
      WHERE  order_status = 'Pending'
        AND  user_id      = 3
  );

SELECT * FROM Orders WHERE user_id = 3;


-- ------------------------------------------------------------
-- Functionality 26: Admin Dashboard - Active Order Queue
-- Concepts: SELECT, JOIN, LEFT JOIN, UNION, ORDER BY
-- Description:
--   Builds the admin's live order queue by combining Pending
--   and Processing orders with UNION. LEFT JOIN brings in
--   customer name and email. Results sorted by date so
--   oldest orders are handled first.
-- ------------------------------------------------------------

SELECT
    o.order_id,
    o.order_date,
    o.order_status,
    o.total_amount,
    o.delivery_address,
    u.full_name  AS customer_name,
    u.email      AS customer_email
FROM Orders o
LEFT JOIN Users u ON o.user_id = u.user_id
WHERE o.order_status = 'Pending'

UNION

SELECT
    o.order_id,
    o.order_date,
    o.order_status,
    o.total_amount,
    o.delivery_address,
    u.full_name,
    u.email
FROM Orders o
LEFT JOIN Users u ON o.user_id = u.user_id
WHERE o.order_status = 'Processing'

ORDER BY order_date ASC;


INSERT INTO Admins (username, email, full_name, password_hash)
VALUES ('admin', 'admin@trace.pk', 'TRACE Admin', 'admin123');


-- ------------------------------------------------------------
-- Functionality 27: Apply a Seasonal Discount to a Category
-- Concepts: UPDATE, WHERE, Subquery
-- Description:
--   Applies a 15% discount to every product in the
--   Streetwear category. The category_id is resolved through
--   a subquery so no ID is hard-coded — stays correct even
--   if IDs change after a migration.
-- ------------------------------------------------------------

UPDATE Products
SET price = price * 0.85
WHERE category_id = (
    SELECT category_id
    FROM   Categories
    WHERE  category_name = 'Streetwear'
);

SELECT
    product_id,
    product_name,
    price AS discounted_price,
    stock_quantity
FROM Products
WHERE category_id = (
    SELECT category_id FROM Categories WHERE category_name = 'Streetwear'
)
ORDER BY price ASC;


-- ------------------------------------------------------------
-- Functionality 28: Products Never Added to Any Cart
-- Concepts: EXCEPT, RIGHT JOIN, SELECT, ORDER BY
-- Description:
--   Finds products that have never been added to any cart.
--   EXCEPT isolates product_ids in Products but absent from
--   Shopping_Cart. RIGHT JOIN retrieves full details. These
--   items are candidates for promotion or removal.
-- ------------------------------------------------------------

SELECT
    p.product_id,
    p.product_name,
    p.price,
    p.stock_quantity,
    p.size,
    p.color,
    c.category_name
FROM (
    SELECT product_id FROM Products
    EXCEPT
    SELECT product_id FROM Shopping_Cart
) AS never_carted
RIGHT JOIN Products   p ON never_carted.product_id = p.product_id
JOIN       Categories c ON p.category_id           = c.category_id
WHERE never_carted.product_id IS NOT NULL
ORDER BY p.stock_quantity DESC;


-- ------------------------------------------------------------
-- Functionality 29: Payment Method Breakdown
-- Concepts: GROUP BY, HAVING, COUNT, SUM, AVG, MIN, MAX,
--           ORDER BY
-- Description:
--   Groups non-cancelled orders by payment method and
--   reports total orders, revenue, average, smallest and
--   largest order per method. HAVING filters out any method
--   with zero real orders. Helps decide which payment
--   options to promote or drop.
-- ------------------------------------------------------------

SELECT
    payment_method,
    COUNT(order_id)   AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    MIN(total_amount) AS smallest_order,
    MAX(total_amount) AS largest_order
FROM Orders
WHERE order_status <> 'Cancelled'
GROUP BY payment_method
HAVING COUNT(order_id) >= 1
ORDER BY total_revenue DESC;


-- ------------------------------------------------------------
-- Functionality 30: Cross-Category Shoppers
-- Concepts: INTERSECT, JOIN, Subquery, SELECT
-- Description:
--   Uses INTERSECT to find users who have ordered from
--   Streetwear AND also from at least one other category.
--   These are the most engaged customers — ideal targets
--   for personalised bundle offers.
-- ------------------------------------------------------------

SELECT
    u.user_id,
    u.username,
    u.full_name,
    u.email,
    u.phone_number,
    COUNT(DISTINCT o.order_id) AS total_orders
FROM   Users  u
JOIN   Orders o ON u.user_id = o.user_id
WHERE  u.user_id IN (

    -- Set A: users who ordered at least one Streetwear item
    SELECT o1.user_id
    FROM   Orders      o1
    JOIN   Order_Items oi1 ON o1.order_id    = oi1.order_id
    JOIN   Products    p1  ON oi1.product_id = p1.product_id
    JOIN   Categories  c1  ON p1.category_id = c1.category_id
    WHERE  c1.category_name = 'Streetwear'

    INTERSECT

    -- Set B: users who ordered at least one Non-Streetwear item
    SELECT o2.user_id
    FROM   Orders      o2
    JOIN   Order_Items oi2 ON o2.order_id    = oi2.order_id
    JOIN   Products    p2  ON oi2.product_id = p2.product_id
    JOIN   Categories  c2  ON p2.category_id = c2.category_id
    WHERE  c2.category_name <> 'Streetwear'

)
GROUP BY u.user_id, u.username, u.full_name, u.email, u.phone_number
ORDER BY total_orders DESC;


-- ============================================================
--  END OF PHASE 2 - GROUP 2
-- ============================================================



SELECT TOP 20
  user_id, username, email, full_name, phone_number, address, registration_date
FROM Users
ORDER BY user_id DESC;

USE OnlineClothingBrand;
INSERT INTO Admins (username, password_hash, full_name, email)
VALUES ('huzaifa_admin', 'huzhehe', 'Muhammad Huzaifa Hayee', 'huzaifaTheAdmin@gmail.com');

SELECT admin_id, username, email, password_hash
FROM Admins
WHERE email = 'huzaifaTheAdmin@gmail.com';
INSERT INTO Admins (username, email, full_name, password_hash)
VALUES ('admin', 'admin@trace.pk', 'TRACE Admin', 'admin123');

USE OnlineClothingBrand;
SELECT * FROM Admins;

-- ============================================================
--  AUTO-GENERATED IMPORTS FROM FRONTEND MOCK DATA
-- ============================================================


-- CATEGORIES --
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'JERSEYS')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('JERSEYS', 'Jerseys category.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'DENIM')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('DENIM', 'Denim and jeans.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'GRAPHIC TEES')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('GRAPHIC TEES', 'Graphic t-shirts.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'SWEATPANTS & TROUSERS')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('SWEATPANTS & TROUSERS', 'Sweatpants and trousers.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'CARGOS')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('CARGOS', 'Cargo pants.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'ESSENTIAL TOPS')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('ESSENTIAL TOPS', 'Basic everyday tops.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'TANK TOPS')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('TANK TOPS', 'Tank tops and sleeveless.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'BABYTEES')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('BABYTEES', 'Baby tees.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'HOODIES')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('HOODIES', 'Hoodies and sweatshirts.');
END
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'OUTERWEAR')
BEGIN
    INSERT INTO Categories (category_name, description) VALUES ('OUTERWEAR', 'Jackets and outerwear.');
END

-- PRODUCTS --
IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = '96 Double Layer Jersey' AND color = 'Electric Blue')
BEGIN
    DECLARE @CatId_96DoubleLayerJersey_ElectricBlue INT;
    SELECT @CatId_96DoubleLayerJersey_ElectricBlue = category_id FROM Categories WHERE category_name = 'JERSEYS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_96DoubleLayerJersey_ElectricBlue, '96 Double Layer Jersey', 'Double-layer mesh construction. Moisture-wicking fabric. Streetwear meets athletic culture.', 2590, 100, 'L', 'Electric Blue', 'https://groovypakistan.com/cdn/shop/files/4_aea94a94-ea5c-4083-8296-0ca07282c278.jpg?crop=center&height=2025&v=1756896134&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = '96 Double Layer Jersey' AND color = 'Black')
BEGIN
    DECLARE @CatId_96DoubleLayerJersey_Black INT;
    SELECT @CatId_96DoubleLayerJersey_Black = category_id FROM Categories WHERE category_name = 'JERSEYS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_96DoubleLayerJersey_Black, '96 Double Layer Jersey', 'Double-layer mesh construction. Moisture-wicking fabric.', 2590, 100, 'L', 'Black', 'https://groovypakistan.com/cdn/shop/files/1_0c3b587c-3b0d-40b4-bf8f-1a9467b1bbbc.jpg?crop=center&height=2025&v=1775575788&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = '96 Double Layer Jersey' AND color = 'Frost Blue')
BEGIN
    DECLARE @CatId_96DoubleLayerJersey_FrostBlue INT;
    SELECT @CatId_96DoubleLayerJersey_FrostBlue = category_id FROM Categories WHERE category_name = 'JERSEYS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_96DoubleLayerJersey_FrostBlue, '96 Double Layer Jersey', 'Double-layer mesh construction. Moisture-wicking fabric.', 2590, 100, 'L', 'Frost Blue', 'https://groovypakistan.com/cdn/shop/files/12_8721e3f1-dd01-4aec-a248-703f8780f3bf.jpg?crop=center&height=2025&v=1756895707&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = '96 Double Layer Jersey' AND color = 'Racing Green')
BEGIN
    DECLARE @CatId_96DoubleLayerJersey_RacingGreen INT;
    SELECT @CatId_96DoubleLayerJersey_RacingGreen = category_id FROM Categories WHERE category_name = 'JERSEYS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_96DoubleLayerJersey_RacingGreen, '96 Double Layer Jersey', 'Double-layer mesh construction. Moisture-wicking fabric.', 2590, 100, 'L', 'Racing Green', 'https://groovypakistan.com/cdn/shop/files/14_17bae632-c615-43bd-a22c-6075517be7fe.jpg?crop=center&height=2025&v=1756894523&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = '96 Double Layer Jersey' AND color = 'Mocha Brown')
BEGIN
    DECLARE @CatId_96DoubleLayerJersey_MochaBrown INT;
    SELECT @CatId_96DoubleLayerJersey_MochaBrown = category_id FROM Categories WHERE category_name = 'JERSEYS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_96DoubleLayerJersey_MochaBrown, '96 Double Layer Jersey', 'Double-layer mesh construction. Moisture-wicking fabric.', 2590, 100, 'L', 'Mocha Brown', 'https://groovypakistan.com/cdn/shop/files/1_b4175311-da33-4136-85f2-b8d296a1715d.jpg?crop=center&height=2025&v=1755776524&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'CORE Denim' AND color = 'Dark Stone')
BEGIN
    DECLARE @CatId_COREDenim_DarkStone INT;
    SELECT @CatId_COREDenim_DarkStone = category_id FROM Categories WHERE category_name = 'DENIM';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_COREDenim_DarkStone, 'CORE Denim', 'Classic 5-pocket construction. Medium wash. Streetwear-cut silhouette.', 3600, 100, '32', 'Dark Stone', 'https://groovypakistan.com/cdn/shop/files/1_073cb8a5-e2b6-4a05-8c0e-8e54ed9c7555.jpg?crop=center&height=2025&v=1772897588&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Jorts' AND color = 'Dark Stone')
BEGIN
    DECLARE @CatId_Jorts_DarkStone INT;
    SELECT @CatId_Jorts_DarkStone = category_id FROM Categories WHERE category_name = 'DENIM';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_Jorts_DarkStone, 'Jorts', 'Above-knee denim shorts. Raw hem finish. Summer staple.', 2400, 100, '32', 'Dark Stone', 'https://groovypakistan.com/cdn/shop/files/5_c1f094c2-34c6-4132-8647-b186d07ecad2.jpg?crop=center&height=2025&v=1767735827&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'CORE Denim' AND color = 'White Stone')
BEGIN
    DECLARE @CatId_COREDenim_WhiteStone INT;
    SELECT @CatId_COREDenim_WhiteStone = category_id FROM Categories WHERE category_name = 'DENIM';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_COREDenim_WhiteStone, 'CORE Denim', 'Light wash denim. Clean minimal finish.', 3600, 100, '32', 'White Stone', 'https://groovypakistan.com/cdn/shop/files/1_38eab3b3-0e8c-44ab-ae20-a5e7c021108f.jpg?crop=center&height=2025&v=1772897363&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'REBIRTH Tee' AND color = 'Mineral Wash')
BEGIN
    DECLARE @CatId_REBIRTHTee_MineralWash INT;
    SELECT @CatId_REBIRTHTee_MineralWash = category_id FROM Categories WHERE category_name = 'GRAPHIC TEES';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_REBIRTHTee_MineralWash, 'REBIRTH Tee', 'Mineral washed heavyweight tee. Vintage feel. TRACE graphic print.', 2490, 100, 'L', 'Mineral Wash', 'https://groovypakistan.com/cdn/shop/files/9_a6fa3c2d-44ff-4280-bb28-4acef96aaa15.jpg?crop=center&height=2025&v=1756891432&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Afterdark Piping Top' AND color = 'Black')
BEGIN
    DECLARE @CatId_AfterdarkPipingTop_Black INT;
    SELECT @CatId_AfterdarkPipingTop_Black = category_id FROM Categories WHERE category_name = 'GRAPHIC TEES';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_AfterdarkPipingTop_Black, 'Afterdark Piping Top', 'Contrast piping detail. Long sleeve. Statement streetwear piece.', 2590, 100, 'L', 'Black', 'https://groovypakistan.com/cdn/shop/files/4332.jpg?crop=center&height=2025&v=1747135205&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'ROLLER TEE' AND color = 'Black + White')
BEGIN
    DECLARE @CatId_ROLLERTEE_BlackWhite INT;
    SELECT @CatId_ROLLERTEE_BlackWhite = category_id FROM Categories WHERE category_name = 'GRAPHIC TEES';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_ROLLERTEE_BlackWhite, 'ROLLER TEE', 'Bold graphic print. Premium cotton. Street-ready silhouette.', 2590, 100, 'L', 'Black + White', 'https://groovypakistan.com/cdn/shop/files/3_6ebb33cf-b84b-4ca6-b31f-2010ae6153d0.jpg?crop=center&height=2025&v=1755899622&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'SOLO LEVELING' AND color = 'Black')
BEGIN
    DECLARE @CatId_SOLOLEVELING_Black INT;
    SELECT @CatId_SOLOLEVELING_Black = category_id FROM Categories WHERE category_name = 'GRAPHIC TEES';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_SOLOLEVELING_Black, 'SOLO LEVELING', 'Anime-inspired graphic. Heavy cotton. Collector''s piece.', 2290, 100, 'L', 'Black', 'https://groovypakistan.com/cdn/shop/files/9_162c6b36-7a1d-497c-8058-bbc3c7d6f43a.jpg?crop=center&height=2025&v=1756893713&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Institute of GRVY' AND color = 'Black + White')
BEGIN
    DECLARE @CatId_InstituteofGRVY_BlackWhite INT;
    SELECT @CatId_InstituteofGRVY_BlackWhite = category_id FROM Categories WHERE category_name = 'GRAPHIC TEES';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_InstituteofGRVY_BlackWhite, 'Institute of GRVY', 'Collegiate-inspired graphic. Premium cotton construction.', 2290, 100, 'L', 'Black + White', 'https://groovypakistan.com/cdn/shop/files/1_d342b41a-852c-4748-a78f-1dd1a93c4e37.jpg?crop=center&height=2025&v=1756293017&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Young & Turnt Tee' AND color = 'Black')
BEGIN
    DECLARE @CatId_YoungTurntTee_Black INT;
    SELECT @CatId_YoungTurntTee_Black = category_id FROM Categories WHERE category_name = 'GRAPHIC TEES';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_YoungTurntTee_Black, 'Young & Turnt Tee', 'Statement graphic. Youth culture inspired. Heavy cotton.', 2290, 100, 'L', 'Black', 'https://groovypakistan.com/cdn/shop/files/1_961722c2-6656-4397-80db-5b01965ca3f9.jpg?crop=center&height=2025&v=1756893545&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Alpha Jersey' AND color = 'Mocha Brown')
BEGIN
    DECLARE @CatId_AlphaJersey_MochaBrown INT;
    SELECT @CatId_AlphaJersey_MochaBrown = category_id FROM Categories WHERE category_name = 'JERSEYS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_AlphaJersey_MochaBrown, 'Alpha Jersey', 'Lightweight mesh jersey. Athletic-inspired streetwear.', 2290, 100, 'L', 'Mocha Brown', 'https://groovypakistan.com/cdn/shop/files/2_2199590b-0c3e-4781-a840-c8a476168c16.jpg?crop=center&height=2025&v=1755781582&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Superman Full Sleeves Tee' AND color = 'Frost + Electric Blue')
BEGIN
    DECLARE @CatId_SupermanFullSleevesTee_FrostElectricBlue INT;
    SELECT @CatId_SupermanFullSleevesTee_FrostElectricBlue = category_id FROM Categories WHERE category_name = 'GRAPHIC TEES';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_SupermanFullSleevesTee_FrostElectricBlue, 'Superman Full Sleeves Tee', 'Full sleeve graphic tee. Pop culture meets streetwear.', 2590, 100, 'L', 'Frost + Electric Blue', 'https://groovypakistan.com/cdn/shop/files/2_1479ad23-9c8a-4123-81ee-e998e0503266.jpg?crop=center&height=2025&v=1756892560&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Baggy Trousers' AND color = 'Black')
BEGIN
    DECLARE @CatId_BaggyTrousers_Black INT;
    SELECT @CatId_BaggyTrousers_Black = category_id FROM Categories WHERE category_name = 'SWEATPANTS & TROUSERS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_BaggyTrousers_Black, 'Baggy Trousers', 'Wide-leg silhouette. Relaxed fit. Everyday streetwear trouser.', 2490, 100, 'M', 'Black', 'https://groovypakistan.com/cdn/shop/files/1_fd68d348-5bf2-480c-8a33-6eb176f05e16.jpg?crop=center&height=2025&v=1756296747&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Baggy Trousers' AND color = 'Mocha Brown')
BEGIN
    DECLARE @CatId_BaggyTrousers_MochaBrown INT;
    SELECT @CatId_BaggyTrousers_MochaBrown = category_id FROM Categories WHERE category_name = 'SWEATPANTS & TROUSERS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_BaggyTrousers_MochaBrown, 'Baggy Trousers', 'Wide-leg silhouette. Relaxed fit. Everyday streetwear trouser.', 2490, 100, 'M', 'Mocha Brown', 'https://groovypakistan.com/cdn/shop/files/4_50f3fa05-251e-405f-b037-f8d71e1809cd.jpg?crop=center&height=2025&v=1756296793&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'CORE Tees' AND color = 'Black')
BEGIN
    DECLARE @CatId_CORETees_Black INT;
    SELECT @CatId_CORETees_Black = category_id FROM Categories WHERE category_name = 'ESSENTIAL TOPS';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_CORETees_Black, 'CORE Tees', 'Essential blank tee. Premium cotton. The perfect base layer.', 2290, 100, 'L', 'Black', 'https://groovypakistan.com/cdn/shop/files/5_965b141a-ad1e-41e2-a463-c9df8897cadc.jpg?crop=center&height=2025&v=1741981383&width=1558');
END

IF NOT EXISTS (SELECT 1 FROM Products WHERE product_name = 'Jorts' AND color = 'White Stone')
BEGIN
    DECLARE @CatId_Jorts_WhiteStone INT;
    SELECT @CatId_Jorts_WhiteStone = category_id FROM Categories WHERE category_name = 'DENIM';
    INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
    VALUES (@CatId_Jorts_WhiteStone, 'Jorts', 'Light wash denim shorts. Above-knee cut. Summer essential.', 2400, 100, '32', 'White Stone', 'https://groovypakistan.com/cdn/shop/files/1_3420be6d-52c3-4854-83ae-1e70511674ea.jpg?crop=center&height=2025&v=1772897986&width=1558');
END

