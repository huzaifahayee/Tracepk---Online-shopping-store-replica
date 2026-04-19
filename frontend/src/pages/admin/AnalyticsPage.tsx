import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const revenueOverTime = Array.from({ length: 30 }, (_, i) => ({
  day: `Apr ${i + 1}`,
  revenue: Math.floor(Math.random() * 50000) + 10000,
}));

const ordersPerDay = Array.from({ length: 14 }, (_, i) => ({
  day: `Apr ${i + 4}`,
  orders: Math.floor(Math.random() * 20) + 5,
}));

const topProducts = [
  { name: '96 Double Layer Jersey', sales: 145 },
  { name: 'CORE Denim', sales: 98 },
  { name: 'REBIRTH Tee', sales: 87 },
  { name: 'Baggy Trousers', sales: 76 },
  { name: 'SOLO LEVELING', sales: 65 },
];

const revenueByCategory = [
  { name: 'Jerseys', value: 35 },
  { name: 'Graphic Tees', value: 28 },
  { name: 'Denim', value: 20 },
  { name: 'Bottoms', value: 12 },
  { name: 'Other', value: 5 },
];

const COLORS = ['hsl(0 0% 7%)', 'hsl(38 94% 54%)', 'hsl(0 0% 44%)', 'hsl(0 0% 70%)', 'hsl(0 0% 87%)'];

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="font-display text-5xl mb-6">ANALYTICS</h1>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">REVENUE OVER TIME</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="hsl(38 94% 54%)" fill="hsl(38 94% 54% / 0.08)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">ORDERS PER DAY</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ordersPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="hsl(0 0% 7%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">TOP PRODUCTS</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 87%)" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(38 94% 54%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-trace p-5">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">REVENUE BY CATEGORY</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={revenueByCategory} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {revenueByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
