import { useParams, Link } from 'react-router-dom';
import { useMyOrder } from '@/hooks/useAuth';
import Badge from '@/components/common/Badge';
import { formatPrice } from '@/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useMyOrder(id || '');

  if (isLoading) {
    return <p className="text-muted-foreground py-10">Loading order...</p>;
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="font-display text-3xl text-muted/20">ORDER NOT FOUND</h2>
        <Link to="/account/orders" className="btn-primary mt-4 inline-block">BACK TO ORDERS</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/account/orders" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
        ← BACK TO ORDERS
      </Link>
      <div className="flex items-center gap-4 mt-4 mb-6">
        <h1 className="font-display text-4xl">ORDER #{order.order_id}</h1>
        <Badge variant={order.order_status} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">ORDER INFO</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(order.order_date).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{order.payment_method}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.delivery_address}</span></div>
          </div>
        </div>
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">ITEMS</h3>
          {order.items?.map((item: any) => (
            <div key={item.product_id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold mt-3 pt-3 border-t border-border">
            <span>Total</span><span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
