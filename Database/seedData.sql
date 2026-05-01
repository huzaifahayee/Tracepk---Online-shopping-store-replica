USE OnlineClothingBrand;
GO

-- 1. Ensure Categories exist
IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'Jerseys')
    INSERT INTO Categories (category_name, description) VALUES ('Jerseys', 'Premium basketball and sports jerseys');

IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'Hoodies')
    INSERT INTO Categories (category_name, description) VALUES ('Hoodies', 'Cozy and oversized streetwear hoodies');

IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'Tops')
    INSERT INTO Categories (category_name, description) VALUES ('Tops', 'Essential and graphic streetwear tops');

IF NOT EXISTS (SELECT 1 FROM Categories WHERE category_name = 'Bottoms')
    INSERT INTO Categories (category_name, description) VALUES ('Bottoms', 'Tactical cargos and baggy trousers');

-- 2. Seed Products with real data from Groovy Pakistan
-- Note: Image URLs are sourced from Groovy Pakistan CDN
DECLARE @JerseyID INT = (SELECT category_id FROM Categories WHERE category_name = 'Jerseys');
DECLARE @HoodieID INT = (SELECT category_id FROM Categories WHERE category_name = 'Hoodies');
DECLARE @TopID    INT = (SELECT category_id FROM Categories WHERE category_name = 'Tops');
DECLARE @BottomID INT = (SELECT category_id FROM Categories WHERE category_name = 'Bottoms');

INSERT INTO Products (category_id, product_name, description, price, stock_quantity, size, color, image_url)
VALUES 
(@JerseyID, '#25 Basketball Jersey', 'Electric Blue + Red premium basketball jersey with culture branding.', 2200.00, 45, 'L', 'Blue', 'https://groovypakistan.com/cdn/shop/files/grvyculture-basketball-jersey.jpg'),
(@HoodieID, '#55 Frost Hoodie', 'Heavyweight oversized frost blue hoodie with high-density print.', 3200.00, 30, 'XL', 'Frost Blue', 'https://groovypakistan.com/cdn/shop/files/55-frost-hoodie.jpg'),
(@HoodieID, '(Washed) Black Hoodie', 'Vintage washed black aesthetic hoodie, super soft fleece.', 3200.00, 25, 'M', 'Washed Black', 'https://groovypakistan.com/cdn/shop/files/washed-black-hoodie.jpg'),
(@TopID, '96 Double Layer Jersey - Black', 'Double-layered streetwear top with mocha brown and white accents.', 2590.00, 50, 'L', 'Black/White', 'https://groovypakistan.com/cdn/shop/files/96-double-layer-jersey-black.jpg'),
(@JerseyID, '88 Athletics Basketball Jersey', 'Racing Green + Gold athletics jersey with premium mesh fabric.', 2200.00, 40, 'L', 'Racing Green', 'https://groovypakistan.com/cdn/shop/files/88-athletics-basketball-jersey.jpg'),
(@TopID, 'Afterdark Piping Top', 'Sleek black top with reflective piping for an edgy night look.', 2590.00, 35, 'M', 'Black', 'https://groovypakistan.com/cdn/shop/files/afterdark-piping-top.jpg'),
(@BottomID, 'Baggy Trousers | Slate Blue', 'Ultra-baggy fit trousers in a unique slate blue shade.', 2490.00, 20, '32', 'Slate Blue', 'https://groovypakistan.com/cdn/shop/files/baggy-trousers-slate-blue.jpg'),
(@TopID, 'Allstars Basketball Jersey', 'Yale Blue & White classic basketball jersey for a sporty vibe.', 2200.00, 55, 'XL', 'Yale Blue', 'https://groovypakistan.com/cdn/shop/files/allstars-basketball-jersey.jpg'),
(@TopID, '5 Way Stitch Top', 'Unique multi-stitch detailed top in deep black.', 2490.00, 30, 'L', 'Black', 'https://groovypakistan.com/cdn/shop/files/5-way-stitch-top.jpg'),
(@BottomID, 'The Tactical Cargo | Camo', 'Heavy-duty tactical cargo pants in forest camo print.', 3600.00, 15, '34', 'Camo', 'https://groovypakistan.com/cdn/shop/files/the-tactical-cargo-camo.jpg');

GO

SELECT * FROM Products;
