USE OnlineClothingBrand;

-- Realistic naming and pricing polish for demo data
UPDATE Products
SET
    product_name = 'Skyline Hoodie Set',
    description = 'Cotton blend hoodie and jogger co-ord for daily wear.',
    price = 4990.00,
    image_url = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80'
WHERE product_name = 'Blue Sky';

UPDATE Products
SET
    product_name = 'Hair Growth Serum',
    description = 'Daily-use scalp serum with lightweight, non-greasy feel.',
    price = 2190.00,
    image_url = 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1000&q=80'
WHERE product_name = 'Minoxidil';

UPDATE Products
SET
    product_name = 'Performance Energy Powder',
    description = 'Workout support formula for focus and endurance.',
    price = 1790.00,
    image_url = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=80'
WHERE product_name = 'Pure Caffeine';

UPDATE Products
SET image_url = 'https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=1000&q=80'
WHERE product_name = 'Men Cotton Shirt';

UPDATE Products
SET image_url = 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80'
WHERE product_name = 'Cotton T-Shirt';

UPDATE Products
SET image_url = 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80'
WHERE product_name = 'Cargo Pants';

