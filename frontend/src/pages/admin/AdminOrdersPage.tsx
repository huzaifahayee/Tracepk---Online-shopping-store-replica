import { useState } from 'react';
import Badge from '@/components/common/Badge';
import { formatPrice } from '@/lib/utils';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdmin';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data: orders, isLoading } = useAdminOrders({
    status: statusFilter,
    search: searchQuery,
    date: dateFilter,
  });
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      toast.success(`Order #${orderId} updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div>
      <h1 className="font-display text-5xl mb-6">ORDERS</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or order #"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border border-border px-3 py-2 text-sm outline-none focus:border-highlight flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-transparent border border-border px-3 py-2 text-sm outline-none focus:border-highlight"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-transparent border border-border px-3 py-2 text-sm outline-none focus:border-highlight"
        />
        <button
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('All');
            setDateFilter('');
          }}
          className="px-4 py-2 text-xs uppercase tracking-widest border border-border hover:bg-muted/20 transition-colors"
        >
          Clear
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : !orders || orders.length === 0 ? (
        <div className="card-trace p-10 text-center">
          <p className="text-muted-foreground">No orders yet. Orders placed by customers will appear here.</p>
        </div>
      ) : (
        <div className="card-trace overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id} className="border-b border-border hover:bg-muted/20">
                  <td className="py-3 px-4 font-display">#{order.order_id}</td>
                  <td className="py-3 px-4">
                    <div>{order.customer_name}</div>
                    <div className="text-[10px] text-muted-foreground">{order.customer_email}</div>
                  </td>
                  <td className="py-3 px-4">{order.item_count}</td>
                  <td className="py-3 px-4">{formatPrice(order.total_amount)}</td>
                  <td className="py-3 px-4"><Badge variant={order.order_status} /></td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                      className="text-[10px] uppercase tracking-widest bg-transparent border border-border px-2 py-1 outline-none focus:border-highlight"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
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
