import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUIStore();
  const { items, removeItem, updateQty, subtotal, itemCount } = useCartStore();
  const total = subtotal();
  const count = itemCount();
  const freeShippingThreshold = 10000;
  const progress = Math.min((total / freeShippingThreshold) * 100, 100);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[199]"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 w-full md:w-96 bg-card border-l border-border h-full z-[200] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 px-5 pt-5">
              <h2 className="font-display text-xl">YOUR BAG ({count})</h2>
              <button onClick={() => setCartOpen(false)}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {count === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center px-5">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                <h3 className="font-display text-3xl mt-4">YOUR BAG IS EMPTY</h3>
                <Link
                  to="/shop"
                  onClick={() => setCartOpen(false)}
                  className="btn-primary mt-4"
                >
                  SHOP NOW →
                </Link>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="overflow-y-auto flex-1 px-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-4 border-b border-border">
                      <div className="w-[72px] aspect-[3/4] bg-muted flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium font-display">{item.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {item.size} {item.color && `/ ${item.color}`}
                        </p>
                        <div className="flex items-center border border-border mt-2 w-fit">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-xs hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1 text-xs text-center min-w-[24px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-xs hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] uppercase text-destructive cursor-pointer mt-1"
                        >
                          REMOVE
                        </button>
                      </div>
                      <span className="text-sm font-semibold ml-auto self-start flex-shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="bg-card border-t border-border px-5 py-5">
                  {/* Free shipping bar */}
                  <div className="mb-3">
                    <div className="h-0.5 bg-muted w-full">
                      <div
                        className="h-full bg-highlight transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {total >= freeShippingThreshold
                        ? "You've unlocked free shipping! ★"
                        : `Rs.${(freeShippingThreshold - total).toLocaleString()} more for free shipping`}
                    </p>
                  </div>

                  <div className="flex justify-between text-[10px] uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-base font-bold">{formatPrice(total)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Shipping calculated at checkout
                  </p>

                  <Link
                    to="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="block w-full bg-highlight text-highlight-foreground text-xs uppercase tracking-widest py-3.5 mt-4 text-center"
                  >
                    CHECKOUT →
                  </Link>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="block w-full border border-border text-xs uppercase tracking-widest py-3 mt-2 text-center hover:bg-muted transition-colors"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
