import { Link } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, itemCount } = useCartStore();
  const total = subtotal();
  const count = itemCount();
  const freeShipping = total >= 10000;

  if (count === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-6xl text-muted/20">YOUR BAG IS EMPTY</h1>
        <Link to="/shop" className="btn-primary mt-6 inline-block">SHOP NOW →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-6xl">YOUR BAG</h1>
      <p className="text-muted-foreground text-sm mt-1">({count} ITEMS)</p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10 mt-8">
        {/* LEFT — Items */}
        <div>
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 py-5 border-b border-border">
              <div className="w-24 aspect-[3/4] bg-muted flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl">{item.name}</h3>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.size} {item.color && `/ ${item.color}`}</p>
                <div className="flex items-center border border-border w-fit mt-3">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-muted">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-3 py-1 text-sm min-w-[24px] text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-muted">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-[10px] uppercase text-destructive cursor-pointer mt-2">
                  REMOVE
                </button>
              </div>
              <span className="text-sm font-semibold ml-auto self-start flex-shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT — Summary */}
        <div>
          <div className="card-trace p-6 sticky top-24">
            <h3 className="text-[10px] uppercase tracking-widest border-b border-border pb-4 mb-4">ORDER SUMMARY</h3>
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span>Shipping</span>
              <span>{freeShipping ? 'FREE' : 'Calculated at checkout'}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest">TOTAL</span>
              <span className="text-xl font-bold">{formatPrice(total)}</span>
            </div>
            <Link to="/checkout" className="block w-full bg-highlight text-highlight-foreground text-xs uppercase tracking-widest py-3.5 mt-4 text-center">
              PROCEED TO CHECKOUT →
            </Link>
            <Link to="/shop" className="block w-full text-xs uppercase tracking-widest py-3 mt-2 text-center text-muted-foreground hover:text-foreground">
              CONTINUE SHOPPING
            </Link>
          </div>

          {/* Free Shipping Progress */}
          <div className="mt-4 p-4">
            <div className="h-0.5 bg-muted w-full">
              <div className="h-full bg-highlight transition-all" style={{ width: `${Math.min((total / 10000) * 100, 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {freeShipping ? "You've unlocked free shipping! ★" : `Rs.${(10000 - total).toLocaleString()} more for free shipping`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
