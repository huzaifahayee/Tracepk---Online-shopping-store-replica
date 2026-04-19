import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Truck, RotateCcw, Banknote, Clock, ChevronDown, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useUIStore } from '@/stores/uiStore';
import { formatPrice, cn } from '@/lib/utils';
import ProductCard from '@/components/common/ProductCard';
import type { Product, ApiProduct } from '@/types';
import { PRODUCT_IMAGE_PLACEHOLDER, fallbackProductImage, productImageUrls } from '@/lib/imageUrl';

const mapToProduct = (apiP: ApiProduct): Product => ({
  id: apiP.product_id,
  name: apiP.product_name,
  subtitle: apiP.color || 'Standard',
  category: apiP.category_name,
  categorySlug: apiP.category_id.toString(),
  price: apiP.price,
  originalPrice: null,
  badge: apiP.stock_quantity === 0 ? 'SOLD OUT' : null,
  slug: apiP.product_id.toString(),
  inStock: apiP.stock_quantity > 0,
  sizes: apiP.size ? apiP.size.split(',') : [],
  colors: apiP.color ? [apiP.color] : [],
  images: productImageUrls(apiP.image_url),
  description: apiP.description || '',
  material: '100% Premium Material',
  fit: 'Oversized Fit',
});

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: apiProduct, isLoading } = useProduct(slug || '');
  const product = apiProduct ? mapToProduct(apiProduct) : null;
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  const wishlisted = product ? isWishlisted(product.id) : false;

  const { data: relatedData } = useProducts({
    category: product?.categorySlug ? Number(product.categorySlug) : null,
    limit: 5
  });

  const related = useMemo(() => {
    if (!relatedData?.items || !product) return [];
    return relatedData.items
      .filter((p) => p.product_id !== product.id)
      .slice(0, 4)
      .map(mapToProduct);
  }, [relatedData, product]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-6 py-20 text-center font-display text-2xl">LOADING...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-6xl text-muted/20">PRODUCT NOT FOUND</h1>
        <Link to="/shop" className="btn-primary mt-4 inline-block">BACK TO SHOP →</Link>
      </div>
    );
  }

  const handleAddToBag = () => {
    if (!selectedSize && product.sizes.length > 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      image: product.images[0],
      price: product.price,
      size: selectedSize,
      color: product.colors[0] || '',
      quantity,
    });
    setCartOpen(true);
  };

  const accordions = [
    { key: 'details', label: 'PRODUCT DETAILS', content: product.description },
    { key: 'fit', label: 'SIZE & FIT', content: product.fit },
    { key: 'material', label: 'MATERIAL & CARE', content: product.material },
  ];

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <span>›</span>
          <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-foreground">{product.category}</Link>
          <span>›</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-14">
          {/* LEFT — Image Gallery */}
          <div>
            <div
              className="aspect-[3/4] w-full bg-muted overflow-hidden cursor-zoom-in"
              onClick={() => setLightbox(true)}
            >
              <img
                src={product.images[mainImage] || PRODUCT_IMAGE_PLACEHOLDER}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => fallbackProductImage(e.currentTarget)}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className={cn(
                      'w-16 h-16 bg-muted overflow-hidden border-2',
                      mainImage === i ? 'border-foreground' : 'border-transparent'
                    )}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => fallbackProductImage(e.currentTarget)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.category}</p>
            <h1 className="font-display text-5xl leading-none mt-1">{product.name}</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{product.subtitle}</p>

            {/* Price */}
            <div className="flex items-center gap-3 mt-4">
              {product.originalPrice ? (
                <>
                  <span className="text-xl font-semibold text-highlight">{formatPrice(product.price)}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                </>
              ) : (
                <span className="text-xl font-semibold">{formatPrice(product.price)}</span>
              )}
            </div>

            <div className="border-b border-border my-5" />

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-foreground/60">SELECT SIZE</span>
                  <button className="text-[10px] text-highlight hover:underline">SIZE GUIDE →</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!product.inStock}
                      className={cn(
                        'border text-xs uppercase px-4 py-2 transition-colors',
                        selectedSize === size
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border hover:border-foreground',
                        !product.inStock && 'line-through text-muted-foreground bg-muted cursor-not-allowed'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5">
              <span className="text-[10px] uppercase tracking-widest text-foreground/60">QUANTITY</span>
              <div className="flex items-center border border-border w-28 mt-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="flex-1 text-center text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-muted">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleAddToBag}
                disabled={!product.inStock || (!selectedSize && product.sizes.length > 0)}
                className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-widest py-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-highlight hover:text-highlight-foreground transition-colors"
              >
                {product.inStock ? 'ADD TO BAG' : 'SOLD OUT'}
              </button>
              <button
                onClick={() => toggle(product)}
                className={cn(
                  'w-full border text-xs uppercase tracking-widest py-3 transition-colors',
                  wishlisted ? 'border-highlight text-highlight' : 'border-border hover:border-foreground'
                )}
              >
                {wishlisted ? '♥ ADDED TO WISHLIST' : 'ADD TO WISHLIST'}
              </button>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 space-y-2">
              {[
                { icon: Truck, text: 'Free shipping on orders over Rs.10,000' },
                { icon: RotateCcw, text: 'Easy 7-day returns & exchanges' },
                { icon: Banknote, text: 'Cash on delivery available' },
                { icon: Clock, text: 'Estimated delivery: 3-5 working days' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {text}
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="mt-6">
              {accordions.map((acc) => (
                <div key={acc.key} className="border-b border-border">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === acc.key ? null : acc.key)}
                    className="py-3 flex justify-between items-center w-full text-[10px] uppercase tracking-widest"
                  >
                    {acc.label}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', openAccordion === acc.key && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {openAccordion === acc.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-muted-foreground pb-4">{acc.content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="font-display text-4xl mb-6">YOU MIGHT ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/90 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-6 right-6 text-white/60 hover:text-white"
            >
              <span className="text-2xl">×</span>
            </button>
            <img
              src={product.images[mainImage] || PRODUCT_IMAGE_PLACEHOLDER}
              alt={product.name}
              className="max-h-[90vh] object-contain"
              onError={(e) => fallbackProductImage(e.currentTarget)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
