import { Link } from 'react-router-dom';
import { useWishlistStore } from '@/stores/wishlistStore';
import ProductCard from '@/components/common/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">MY WISHLIST</h1>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="font-display text-3xl text-muted/20">YOUR WISHLIST IS EMPTY</h2>
          <Link to="/shop" className="btn-primary mt-4 inline-block">SHOP NOW →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
