import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import Badge from './Badge';
import type { Product } from '@/types';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggle, isWishlisted } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const wishlisted = isWishlisted(product.id);
  const [showSizes, setShowSizes] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    if (product.sizes.length > 0) {
      setShowSizes(true);
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        subtitle: product.subtitle,
        image: product.images[0],
        price: product.price,
        size: '',
        color: product.colors[0] || '',
        quantity: 1,
      });
      setCartOpen(true);
    }
  };

  const handleSizeSelect = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      image: product.images[0],
      price: product.price,
      size,
      color: product.colors[0] || '',
      quantity: 1,
    });
    setShowSizes(false);
    setCartOpen(true);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="relative bg-card border border-border hover:border-highlight transition-colors duration-200 cursor-pointer group block"
    >
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          loading="lazy"
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alt`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
          />
        )}

        {/* Badges */}
        {product.badge && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant={product.badge} />
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product);
          }}
          className="absolute top-2 right-2 bg-card/80 p-1.5"
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              wishlisted ? 'fill-highlight text-highlight' : 'text-muted-foreground'
            )}
          />
        </button>

        {/* Quick Add */}
        {!showSizes ? (
          <button
            onClick={handleQuickAdd}
            className={cn(
              'absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[9px] uppercase tracking-widest py-2.5 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-200',
              !product.inStock && 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {product.inStock ? 'QUICK ADD' : 'SOLD OUT'}
          </button>
        ) : (
          <div
            className="absolute bottom-0 left-0 right-0 bg-primary p-2 flex flex-wrap gap-1 justify-center"
            onClick={(e) => e.preventDefault()}
          >
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeSelect(size, e)}
                className="text-[9px] uppercase tracking-widest text-primary-foreground border border-primary-foreground/20 px-2 py-1 hover:bg-primary-foreground hover:text-primary transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <h3 className="font-display text-lg leading-tight">{product.name}</h3>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
          {product.subtitle}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {product.originalPrice ? (
            <>
              <span className="text-sm font-semibold text-highlight">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
