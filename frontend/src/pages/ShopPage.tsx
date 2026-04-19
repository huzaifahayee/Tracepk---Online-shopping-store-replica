import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { ProductCardSkeleton } from '@/components/common/Skeleton';
import { useProducts, useCategories } from '@/hooks/useProducts';
import type { Product, SortOption, ApiProduct } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const mapToProduct = (apiP: ApiProduct): Product => ({
  id: apiP.product_id,
  name: apiP.product_name,
  subtitle: apiP.color || 'Standard',
  category: apiP.category_name,
  categorySlug: apiP.category_name.toLowerCase().replace(/ /g, '-'),
  price: apiP.price,
  originalPrice: null,
  badge: apiP.stock_quantity === 0 ? 'SOLD OUT' : null,
  slug: apiP.product_id.toString(), // Use ID as slug for simplicity or actual slug if available
  inStock: apiP.stock_quantity > 0,
  sizes: apiP.size ? apiP.size.split(',') : [],
  colors: apiP.color ? [apiP.color] : [],
  images: [apiP.image_url || ''],
  description: apiP.description || '',
  material: '100% Premium Material',
  fit: 'Oversized Fit',
});

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Best Selling', value: 'best_selling' },
  { label: 'Most Popular', value: 'most_popular' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';
  const sortFilter = (searchParams.get('sort') || 'newest') as SortOption;
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const { data: categoriesData } = useCategories();
  const { data: productsData, isLoading } = useProducts({
    category: categoryFilter ? Number(categoryFilter) : null,
    sort: sortFilter,
  });
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const filtered = useMemo(() => {
    if (!productsData?.items) return [];
    let items = productsData.items.map(mapToProduct);

    if (selectedSizes.length > 0) {
      items = items.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }
    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    return items;
  }, [productsData, selectedSizes, inStockOnly]);

  const currentCategory = categoriesData?.find((c) => c.category_id.toString() === categoryFilter);

  const updateSort = (sort: SortOption) => {
    const p = new URLSearchParams(searchParams);
    p.set('sort', sort);
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setInStockOnly(false);
    setSearchParams({});
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span>{currentCategory?.category_name || 'SHOP'}</span>
        </div>
        <h1 className="font-display text-6xl">{currentCategory?.category_name || 'ALL PRODUCTS'}</h1>
        <p className="text-[10px] text-muted-foreground mt-1">{filtered.length} products</p>
      </div>

      {/* Filter + Sort Bar */}
      <div className="sticky top-[88px] bg-background/95 backdrop-blur-sm border-b border-border py-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Active filter chips */}
          {categoryFilter && (
            <span className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 flex items-center gap-1">
              {currentCategory?.category_name}
              <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedSizes.map((s) => (
            <span key={s} className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 flex items-center gap-1">
              {s}
              <button onClick={() => toggleSize(s)}><X className="h-3 w-3" /></button>
            </span>
          ))}
          <button
            onClick={() => setFilterOpen(true)}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <SlidersHorizontal className="h-3 w-3" /> FILTERS
          </button>
        </div>

        <select
          value={sortFilter}
          onChange={(e) => updateSort(e.target.value as SortOption)}
          className="text-[10px] uppercase tracking-widest bg-transparent border-b border-input outline-none py-1 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="font-display text-5xl text-muted/20">NO PRODUCTS FOUND</h2>
          <button onClick={clearFilters} className="btn-primary mt-4">CLEAR FILTERS →</button>
        </div>
      )}

      {/* Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[199]"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 w-80 bg-card border-r border-border h-full z-[200] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h3 className="font-display text-xl">FILTERS</h3>
                <button onClick={() => setFilterOpen(false)}><X className="h-5 w-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* Category */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">CATEGORY</h4>
                  <div className="space-y-2">
                    {categoriesData?.map((cat) => (
                      <label key={cat.category_id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryFilter === cat.category_id.toString()}
                          onChange={() => {
                            const p = new URLSearchParams(searchParams);
                            if (categoryFilter === cat.category_id.toString()) p.delete('category');
                            else p.set('category', cat.category_id.toString());
                            setSearchParams(p);
                          }}
                          className="accent-highlight"
                        />
                        {cat.category_name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">SIZE</h4>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`text-xs uppercase px-3 py-1.5 border transition-colors ${
                          selectedSizes.includes(size)
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border hover:border-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock */}
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="accent-highlight"
                    />
                    IN STOCK ONLY
                  </label>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-border space-y-2">
                <button onClick={() => setFilterOpen(false)} className="w-full btn-primary py-3">
                  APPLY FILTERS
                </button>
                <button onClick={() => { clearFilters(); setFilterOpen(false); }} className="w-full btn-ghost text-center">
                  CLEAR ALL
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
