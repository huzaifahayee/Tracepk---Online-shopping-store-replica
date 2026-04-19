import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

const COLORS = ['hsl(0 0% 7%)', 'hsl(38 94% 54%)', 'hsl(0 0% 44%)', 'hsl(0 0% 70%)', 'hsl(0 0% 87%)'];

export default function AnalyticsPage() {
  const { data: dashboard, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-5xl mb-6">ANALYTICS</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-trace p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="h-[280px] bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div>
        <h1 className="font-display text-5xl mb-6">ANALYTICS</h1>
        <div className="card-trace p-10 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Failed to load analytics data. Please try again.</p>
        </div>
      </div>
    );
  }

  const revenueOverTime = (dashboard.revenue_over_time || []).map((d) => ({
    day: new Date(d.order_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Number(d.daily_revenue),
    orders: d.orders_count,
  }));

  const ordersPerDay = (dashboard.revenue_over_time || []).map((d) => ({
    day: new Date(d.order_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: d.orders_count,
  }));

  const topProducts = (dashboard.top_products || []).map((p) => ({
    name: p.product_name.length > 25 ? p.product_name.slice(0, 25) + '...' : p.product_name,
    sales: p.units_sold,
    revenue: Number(p.revenue),
  }));

  const revenueByCategory = (dashboard.revenue_by_category || [])
    .filter((c) => c.revenue > 0)
    .map((c) => ({
      name: c.category_name,
      value: Number(c.revenue),
    }));

  // Summary stats
  const totalRevenue = Number(dashboard.total_revenue);
  const avgOrderValue = dashboard.total_orders > 0 ? totalRevenue / dashboard.total_orders : 0;

  return (
    <div>
      <h1 className="font-display text-5xl mb-6">ANALYTICS</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-trace p-5">
          <p className="font-display text-3xl">{formatPrice(totalRevenue)}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Total Revenue</p>
        </div>
        <div className="card-trace p-5">
          <p className="font-display text-3xl">{dashboard.total_orders}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Total Orders</p>
        </div>
        <div className="card-trace p-5">
          <p className="font-display text-3xl">{formatPrice(avgOrderValue)}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Avg Order Value</p>
        </div>
        <div className="card-trace p-5">
          <p className="font-display text-3xl">{dashboard.total_users}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Total Users</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">REVENUE OVER TIME</h3>
          {revenueOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(38 94% 54%)" fill="hsl(38 94% 54% / 0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No revenue data available</p>
          )}
        </div>
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">ORDERS PER DAY</h3>
          {ordersPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ordersPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(0 0% 7%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No order data available</p>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">TOP PRODUCTS</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(38 94% 54%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No product sales data</p>
          )}
        </div>
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">REVENUE BY CATEGORY</h3>
          {revenueByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={revenueByCategory} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${formatPrice(value)}`}>
                  {revenueByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No category revenue data</p>
          )}
        </div>
      </div>
    </div>
  );
}
