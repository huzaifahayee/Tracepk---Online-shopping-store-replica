USE OnlineClothingBrand;
GO

-- 1. Trigger to deduct stock after an order item is added
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

-- 2. Trigger to prevent negative stock (safety check)
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

-- 3. Audit Log Table for Order Status Changes
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

-- 4. Trigger to log status changes automatically
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
