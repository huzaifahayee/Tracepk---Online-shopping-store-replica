import { Link } from 'react-router-dom';
import Badge from '@/components/common/Badge';
import { useMyOrders } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';

export default function AccountOrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">MY ORDERS</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="font-display text-3xl text-muted/20">NO ORDERS YET</h2>
          <Link to="/shop" className="btn-primary mt-4 inline-block">SHOP NOW →</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Date', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.order_id} className="border-b border-border hover:bg-muted/20">
                  <td className="py-3 font-display">#{order.order_id}</td>
                  <td className="py-3 text-muted-foreground">{new Date(order.order_date).toLocaleDateString()}</td>
                  <td className="py-3">{formatPrice(order.total_amount)}</td>
                  <td className="py-3"><Badge variant={order.order_status} /></td>
                  <td className="py-3">
                    <Link to={`/account/orders/${order.order_id}`} className="text-[10px] uppercase tracking-widest text-highlight hover:underline">
                      VIEW →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
