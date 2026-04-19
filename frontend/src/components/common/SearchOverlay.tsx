import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useSearchProducts } from '@/hooks/useProducts';
import type { Product, ApiProduct } from '@/types';

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
  images: [apiP.image_url || ''],
  description: apiP.description || '',
  material: '100% Cotton',
  fit: 'Oversized Fit',
});

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState('');
  
  const { data: searchResults } = useSearchProducts(query);

  const results = useMemo(() => {
    return (searchResults || []).map(mapToProduct);
  }, [searchResults]);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('trace-searches') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (query.length >= 2 && results.length > 0) {
      const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('trace-searches', JSON.stringify(updated));
    }
  }, [query, results.length]);


  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [searchOpen]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-primary overflow-y-auto"
        >
          <div className="max-w-5xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display text-xl text-primary-foreground tracking-widest">
                TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
              </h2>
              <button onClick={() => setSearchOpen(false)}>
                <X className="h-5 w-5 text-primary-foreground/60 hover:text-primary-foreground" />
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH..."
              autoFocus
              className="font-display text-4xl md:text-6xl text-primary-foreground border-b-2 border-primary-foreground/20 focus:border-highlight bg-transparent w-full outline-none pb-4 placeholder:text-primary-foreground/20"
            />

            {/* Recent Searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mb-3">
                  Recent Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="text-[10px] uppercase tracking-widest bg-highlight/20 text-highlight px-3 py-1"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {query.length >= 2 && results.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10" onClick={() => setSearchOpen(false)}>
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && results.length === 0 && (
              <div className="flex items-center justify-center mt-20">
                <h3 className="font-display text-4xl text-primary-foreground/20">
                  NO PRODUCTS FOUND
                </h3>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
