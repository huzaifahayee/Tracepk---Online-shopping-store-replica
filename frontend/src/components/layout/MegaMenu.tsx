import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useProducts';

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MegaMenu({ open, onClose }: MegaMenuProps) {
  const { data: categories } = useCategories();

  // Split categories into columns dynamically
  const topCategories = categories?.filter((c) =>
    ['JERSEYS', 'GRAPHIC TEES', 'ESSENTIAL TOPS', 'TANK TOPS', 'HOODIES', 'BABYTEES', 'OUTERWEAR'].includes(c.category_name.toUpperCase())
  ) || [];

  const bottomCategories = categories?.filter((c) =>
    ['SWEATPANTS', 'CARGOS', 'DENIM'].includes(c.category_name.toUpperCase())
  ) || [];

  const otherCategories = categories?.filter((c) => {
    const name = c.category_name.toUpperCase();
    return !['JERSEYS', 'GRAPHIC TEES', 'ESSENTIAL TOPS', 'TANK TOPS', 'HOODIES', 'BABYTEES', 'OUTERWEAR', 'SWEATPANTS', 'CARGOS', 'DENIM'].includes(name);
  }) || [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 right-0 bg-primary border-t border-primary-foreground/10 overflow-hidden z-[50]"
        >
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-4 gap-8">
            {/* Col 1 — Tops */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mb-3">
                TOPS
              </h4>
              <div className="space-y-2">
                {topCategories.map((cat) => (
                  <Link
                    key={cat.category_id}
                    to={`/shop?category=${cat.category_id}`}
                    onClick={onClose}
                    className="block text-[10px] uppercase tracking-widest text-primary-foreground/55 hover:text-primary-foreground transition-colors"
                  >
                    {cat.category_name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 2 — Bottoms */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mb-3">
                BOTTOMS
              </h4>
              <div className="space-y-2">
                {bottomCategories.map((cat) => (
                  <Link
                    key={cat.category_id}
                    to={`/shop?category=${cat.category_id}`}
                    onClick={onClose}
                    className="block text-[10px] uppercase tracking-widest text-primary-foreground/55 hover:text-primary-foreground transition-colors"
                  >
                    {cat.category_name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 3 — Collections & Other */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mb-3">
                COLLECTIONS
              </h4>
              <div className="space-y-2">
                <Link to="/shop?sort=newest" onClick={onClose} className="block text-[10px] uppercase tracking-widest text-primary-foreground/55 hover:text-primary-foreground transition-colors">
                  New In
                </Link>
                <Link to="/shop" onClick={onClose} className="block text-[10px] uppercase tracking-widest text-primary-foreground/55 hover:text-primary-foreground transition-colors">
                  View All
                </Link>
                {otherCategories.map((cat) => (
                  <Link
                    key={cat.category_id}
                    to={`/shop?category=${cat.category_id}`}
                    onClick={onClose}
                    className="block text-[10px] uppercase tracking-widest text-primary-foreground/55 hover:text-primary-foreground transition-colors"
                  >
                    {cat.category_name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 4 — Featured Image */}
            <div className="relative overflow-hidden aspect-[3/4]">
              <img
                src="https://groovypakistan.com/cdn/shop/files/23.jpg?crop=center&height=1620&v=1772634037&width=1080"
                alt="New Drop"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <Link
                  to="/shop?sort=newest"
                  onClick={onClose}
                  className="text-highlight text-[10px] uppercase tracking-widest font-medium"
                >
                  NEW DROP →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
