USE OnlineClothingBrand;
GO

-- 1. Atomic Order Placement (Manual insertion)
BEGIN TRANSACTION;
BEGIN TRY
    INSERT INTO Orders (user_id, total_amount, delivery_address, order_status)
    VALUES (3, 6400.00, '789 Gains Blvd', 'Pending');

    DECLARE @orderId INT = SCOPE_IDENTITY();

    INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)
    VALUES (@orderId, 6, 2, 1200.00);

    INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)
    VALUES (@orderId, 7, 1, 3200.00);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT ERROR_MESSAGE();
END CATCH;
GO

-- 2. Order Cancellation with Stock Restoration
DECLARE @cancelOrderId INT = 2;
BEGIN TRANSACTION;
BEGIN TRY
    -- Restore stock
    UPDATE p
    SET    p.stock_quantity = p.stock_quantity + oi.quantity
    FROM   Products    p
    JOIN   Order_Items oi ON p.product_id = oi.product_id
    WHERE  oi.order_id = @cancelOrderId;

    -- Cancel order
    UPDATE Orders
    SET    order_status = 'Cancelled'
    WHERE  order_id     = @cancelOrderId
      AND  order_status NOT IN ('Delivered', 'Cancelled');

    IF @@ROWCOUNT = 0
        THROW 50001, 'Order cannot be cancelled.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT ERROR_MESSAGE();
END CATCH;
GO

-- 3. Shopping Cart Checkout Transaction
DECLARE @checkoutUserId INT = 1;
BEGIN TRANSACTION;
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM Shopping_Cart WHERE user_id = @checkoutUserId)
        THROW 50002, 'Cart is empty.', 1;

    DECLARE @cartTotal DECIMAL(10,2);
    SELECT @cartTotal = SUM(sc.quantity * p.price)
    FROM   Shopping_Cart sc
    JOIN   Products      p ON sc.product_id = p.product_id
    WHERE  sc.user_id = @checkoutUserId;

    DECLARE @userAddr VARCHAR(255);
    SELECT @userAddr = address FROM Users WHERE user_id = @checkoutUserId;

    INSERT INTO Orders (user_id, total_amount, delivery_address, order_status)
    VALUES (@checkoutUserId, @cartTotal, @userAddr, 'Pending');

    DECLARE @newOrderId INT = SCOPE_IDENTITY();

    INSERT INTO Order_Items (order_id, product_id, quantity, unit_price)
    SELECT @newOrderId, sc.product_id, sc.quantity, p.price
    FROM   Shopping_Cart sc
    JOIN   Products      p ON sc.product_id = p.product_id
    WHERE  sc.user_id = @checkoutUserId;

    -- Clear cart after successful order
    DELETE FROM Shopping_Cart WHERE user_id = @checkoutUserId;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT ERROR_MESSAGE();
END CATCH;
GO
