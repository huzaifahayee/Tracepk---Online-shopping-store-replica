import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Badge from '@/components/common/Badge';
import { formatPrice } from '@/lib/utils';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { Users, ShoppingBag, DollarSign, Clock, AlertCircle } from 'lucide-react';

const PIE_COLORS = ['hsl(0 0% 7%)', 'hsl(38 94% 54%)', 'hsl(0 0% 44%)', 'hsl(0 0% 87%)', 'hsl(0 60% 50%)'];

export default function AdminOverviewPage() {
  const { data: dashboard, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-5xl mb-6">OVERVIEW</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-trace p-5 animate-pulse">
              <div className="h-8 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div>
        <h1 className="font-display text-5xl mb-6">OVERVIEW</h1>
        <div className="card-trace p-10 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Failed to load dashboard data. Make sure the backend is running.</p>
        </div>
      </div>
    );
  }

  const revenueData = (dashboard.revenue_over_time || []).map((d) => ({
    day: new Date(d.order_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Number(d.daily_revenue),
  }));

  const orderStatusData = dashboard.order_status_breakdown || [];

  const topProducts = (dashboard.top_products || []).map((p) => ({
    name: p.product_name.length > 20 ? p.product_name.slice(0, 20) + '...' : p.product_name,
    sales: p.units_sold,
  }));

  const stats = [
    { label: 'Total Users', value: String(dashboard.total_users), icon: Users, accent: 'text-foreground' },
    { label: 'Total Orders', value: String(dashboard.total_orders), icon: ShoppingBag, accent: 'text-foreground' },
    { label: 'Total Revenue', value: formatPrice(dashboard.total_revenue), icon: DollarSign, accent: 'text-highlight' },
    { label: 'Pending Orders', value: String(dashboard.pending_orders), icon: Clock, accent: 'text-foreground' },
  ];

  const recentOrders = dashboard.recent_orders || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-5xl">OVERVIEW</h1>
        <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-trace p-5">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.accent} opacity-60`} />
            </div>
            <p className={`font-display text-4xl ${stat.accent}`}>{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Over Time */}
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">REVENUE (LAST 30 DAYS)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(38 94% 54%)" fill="hsl(38 94% 54% / 0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No revenue data in the last 30 days</p>
          )}
        </div>

        {/* Orders by Status */}
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">ORDERS BY STATUS</h3>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {orderStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No orders yet</p>
          )}
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="card-trace p-5 mb-6">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">TOP PRODUCTS BY UNITS SOLD</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={140} />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(38 94% 54%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card-trace">
        <div className="p-5 border-b border-border">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">RECENT ORDERS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-5 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.order_id} className="border-b border-border hover:bg-muted/20">
                    <td className="py-3 px-5 font-display">#{order.order_id}</td>
                    <td className="py-3 px-5">{order.customer_name}</td>
                    <td className="py-3 px-5">{formatPrice(order.total_amount)}</td>
                    <td className="py-3 px-5"><Badge variant={order.order_status} /></td>
                    <td className="py-3 px-5 text-muted-foreground">{new Date(order.order_date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
