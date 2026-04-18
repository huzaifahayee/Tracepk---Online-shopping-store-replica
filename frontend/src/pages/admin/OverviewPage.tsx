import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Badge from '@/components/common/Badge';
import { formatPrice } from '@/lib/utils';
import { useAdminDashboard } from '@/hooks/useAdmin';

const PIE_COLORS = ['hsl(0 0% 7%)', 'hsl(38 94% 54%)', 'hsl(0 0% 44%)', 'hsl(0 0% 87%)', 'hsl(0 60% 50%)'];

export default function AdminOverviewPage() {
  const { data: dashboard, isLoading } = useAdminDashboard();

  if (isLoading) {
    return <p className="text-muted-foreground p-5">Loading dashboard...</p>;
  }

  if (!dashboard) {
    return <p className="text-muted-foreground p-5">Failed to load dashboard data.</p>;
  }

  const stats = [
    { label: 'Total Revenue', value: formatPrice(dashboard.totalRevenue), change: `${dashboard.totalOrders} orders` },
    { label: 'Pending Orders', value: String(dashboard.pendingOrders), change: 'action needed' },
    { label: 'Total Customers', value: String(dashboard.totalUsers), change: 'registered' },
    { label: 'Products Live', value: String(dashboard.activeProducts), change: 'active' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-5xl">OVERVIEW</h1>
        <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-trace p-5">
            <p className="font-display text-4xl">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
            <span className="text-[10px] text-highlight mt-1 inline-block">{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">REVENUE</h3>
          {dashboard.revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dashboard.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(38 94% 54%)" fill="hsl(38 94% 54% / 0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No revenue data yet</p>
          )}
        </div>
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">ORDERS BY STATUS</h3>
          {dashboard.orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dashboard.orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {dashboard.orderStatusData.map((_, i) => (
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
              {dashboard.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet</td></tr>
              ) : (
                dashboard.recentOrders.map((order) => (
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
