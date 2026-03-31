import { useApp } from '@/contexts/AppContext';
import {
  ShoppingCart, DollarSign, Grid3X3, Globe,
  TrendingUp, ArrowUpRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const dailyRevenue = [
  { day: 'Mon', revenue: 12400 },
  { day: 'Tue', revenue: 15800 },
  { day: 'Wed', revenue: 9200 },
  { day: 'Thu', revenue: 18600 },
  { day: 'Fri', revenue: 22100 },
  { day: 'Sat', revenue: 28400 },
  { day: 'Sun', revenue: 24800 },
];

const orderSourceData = [
  { name: 'Dine-in', value: 45, color: 'hsl(215, 50%, 18%)' },
  { name: 'Swiggy', value: 30, color: 'hsl(18, 100%, 60%)' },
  { name: 'Zomato', value: 25, color: 'hsl(0, 84%, 50%)' },
];

const Dashboard = () => {
  const { tables, orders, onlineOrders } = useApp();
  const activeTables = tables.filter(t => t.status === 'occupied').length;
  const totalOrders = orders.length + onlineOrders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0) + onlineOrders.reduce((s, o) => s + o.total, 0);
  const pendingOnline = onlineOrders.filter(o => o.status === 'pending').length;

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, change: '+12%', color: 'text-primary' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, change: '+8%', color: 'text-success' },
    { label: 'Active Tables', value: `${activeTables}/${tables.length}`, icon: Grid3X3, change: '', color: 'text-accent-foreground' },
    { label: 'Online Orders', value: onlineOrders.length, icon: Globe, change: `${pendingOnline} pending`, color: 'text-warning' },
  ];

  const recentOrders = [...orders, ...onlineOrders.map(o => ({
    id: o.id,
    tableId: 0,
    items: o.items.map(i => ({ ...i, id: '', category: 'main_course' as const, veg: true })),
    total: o.total,
    status: o.status as string,
    createdAt: o.createdAt,
    platform: o.platform,
  }))].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back! Here's your restaurant overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                {stat.change && (
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success font-medium">{stat.change}</span>
                  </div>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
              <XAxis dataKey="day" stroke="hsl(215, 15%, 47%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 47%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(214, 20%, 92%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="revenue" fill="hsl(18, 100%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Order Sources</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderSourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {orderSourceData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {orderSourceData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Orders</h3>
          <button className="text-sm text-primary flex items-center gap-1 hover:underline">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-muted-foreground font-medium">Order ID</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Source</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Amount</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-medium text-foreground">{order.id}</td>
                  <td className="py-3">
                    {'platform' in order && order.platform ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.platform === 'swiggy' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {(order.platform as string).charAt(0).toUpperCase() + (order.platform as string).slice(1)}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">Table {order.tableId}</span>
                    )}
                  </td>
                  <td className="py-3 text-foreground">₹{order.total}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
