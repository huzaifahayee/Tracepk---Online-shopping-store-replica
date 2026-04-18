import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAdminDashboard } from '@/hooks/useAdmin';

const COLORS = ['hsl(0 0% 7%)', 'hsl(38 94% 54%)', 'hsl(0 0% 44%)', 'hsl(0 0% 70%)', 'hsl(0 0% 87%)'];

export default function AnalyticsPage() {
  const { data: dashboard, isLoading } = useAdminDashboard();

  if (isLoading) {
    return <p className="text-muted-foreground p-5">Loading analytics...</p>;
  }

  if (!dashboard) {
    return <p className="text-muted-foreground p-5">Failed to load analytics data.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-5xl mb-6">ANALYTICS</h1>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">REVENUE OVER TIME</h3>
          {dashboard.revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dashboard.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(38 94% 54%)" fill="hsl(38 94% 54% / 0.08)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No revenue data yet</p>
          )}
        </div>
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">ORDERS PER DAY</h3>
          {dashboard.revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dashboard.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(0 0% 7%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No order data yet</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">TOP PRODUCTS</h3>
          {dashboard.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dashboard.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(38 94% 54%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No sales data yet</p>
          )}
        </div>
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">REVENUE BY CATEGORY</h3>
          {dashboard.revenueByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dashboard.revenueByCategory} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {dashboard.revenueByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-10 text-center">No revenue data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
