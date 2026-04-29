USE OnlineClothingBrand;
GO

CREATE OR ALTER TRIGGER trg_DeductStock_AfterOrderItem
ON Order_Items
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE p
    SET    p.stock_quantity = p.stock_quantity - i.quantity
    FROM   Products p
    JOIN   inserted i ON p.product_id = i.product_id;
END;
GO

CREATE OR ALTER TRIGGER trg_PreventNegativeStock
ON Order_Items
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM   Products p
        JOIN   inserted i ON p.product_id = i.product_id
        WHERE  p.stock_quantity < 0
    )
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR ('Order rejected: insufficient stock for one or more products.', 16, 1);
    END
END;
GO

IF OBJECT_ID('dbo.Order_Status_Log', 'U') IS NULL
BEGIN
    CREATE TABLE Order_Status_Log (
        log_id        INT IDENTITY(1,1) PRIMARY KEY,
        order_id      INT          NOT NULL,
        old_status    VARCHAR(20)  NOT NULL,
        new_status    VARCHAR(20)  NOT NULL,
        changed_at    DATETIME     DEFAULT GETDATE(),
        changed_by    VARCHAR(100) DEFAULT SYSTEM_USER
    );
END;
GO

CREATE OR ALTER TRIGGER trg_LogOrderStatusChange
ON Orders
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(order_status)
    BEGIN
        INSERT INTO Order_Status_Log (order_id, old_status, new_status)
        SELECT
            d.order_id,
            d.order_status,
            i.order_status
        FROM deleted  d
        JOIN inserted i ON d.order_id = i.order_id
        WHERE d.order_status <> i.order_status;
    END
END;
GO

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

DECLARE @cancelOrderId INT = 2;

BEGIN TRANSACTION;
BEGIN TRY
    UPDATE p
    SET    p.stock_quantity = p.stock_quantity + oi.quantity
    FROM   Products    p
    JOIN   Order_Items oi ON p.product_id = oi.product_id
    WHERE  oi.order_id = @cancelOrderId;

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

    DELETE FROM Shopping_Cart WHERE user_id = @checkoutUserId;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT ERROR_MESSAGE();
END CATCH;
GO
