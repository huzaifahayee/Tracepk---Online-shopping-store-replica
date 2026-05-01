/* schema.sql – core database schema */
CREATE DATABASE IF NOT EXISTS OnlineClothingBrand;
GO
USE OnlineClothingBrand;
GO
-- Users table
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address VARCHAR(255),
    registration_date DATETIME DEFAULT GETDATE()
);
GO
-- Admins table
CREATE TABLE Admins (
    admin_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    last_login DATETIME
);
GO
-- Categories table
CREATE TABLE Categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);
GO
-- Products table
CREATE TABLE Products (
    product_id INT IDENTITY(1,1) PRIMARY KEY,
    category_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    size VARCHAR(20),
    color VARCHAR(50),
    image_url VARCHAR(255),
    date_added DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
);
GO
-- Orders table
CREATE TABLE Orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    order_date DATETIME DEFAULT GETDATE(),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    delivery_address VARCHAR(255) NOT NULL,
    order_status VARCHAR(20) DEFAULT 'Pending' CHECK (order_status IN ('Pending','Processing','Shipped','Delivered','Cancelled')),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
GO
-- Order_Items table
CREATE TABLE Order_Items (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
GO
-- Shopping_Cart table
CREATE TABLE Shopping_Cart (
    cart_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    date_added DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Cart_Users FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_Cart_Products FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
GO
-- Settings (key/value) table – used for announcement bar etc.
CREATE TABLE Settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(500) NOT NULL
);
GO
