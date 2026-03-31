import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OnlineOrderStatus } from '@/data/mockData';

const statusFlow: OnlineOrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const statusLabels: Record<OnlineOrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const OnlineOrders = () => {
  const { onlineOrders, updateOnlineOrderStatus } = useApp();
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = onlineOrders.filter(o => {
    if (platformFilter !== 'all' && o.platform !== platformFilter) return false;
    if (search && !o.customerName.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getNextStatus = (current: OnlineOrderStatus): OnlineOrderStatus | null => {
    const idx = statusFlow.indexOf(current);
    return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const getActionLabel = (status: OnlineOrderStatus): string => {
    switch (status) {
      case 'pending': return 'Accept Order';
      case 'accepted': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Out for Delivery';
      case 'out_for_delivery': return 'Mark Delivered';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Online Orders</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'swiggy', 'zomato'].map(p => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                platformFilter === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(order => {
          const nextStatus = getNextStatus(order.status);
          const statusIdx = statusFlow.indexOf(order.status);

          return (
            <div key={order.id} className="glass-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                    order.platform === 'swiggy' ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                  )}>
                    {order.platform}
                  </span>
                  <span className="text-sm font-bold text-foreground">{order.id}</span>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  order.paymentType === 'prepaid' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                )}>
                  {order.paymentType === 'prepaid' ? 'Paid' : 'COD'}
                </span>
              </div>

              <p className="font-medium text-foreground">{order.customerName}</p>
              <p className="text-xs text-muted-foreground mb-3">{order.customerAddress}</p>

              <div className="space-y-1 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                    <span className="text-foreground">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2 mb-3">
                <span>Total</span><span>₹{order.total}</span>
              </div>

              {/* Status progress */}
              <div className="flex gap-0.5 mb-3">
                {statusFlow.map((_, i) => (
                  <div key={i} className={cn("h-1 flex-1 rounded-full", i <= statusIdx ? "bg-primary" : "bg-muted")} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-3">Status: <span className="font-medium text-foreground capitalize">{statusLabels[order.status]}</span></p>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button onClick={() => updateOnlineOrderStatus(order.id, 'accepted')}
                    className="flex-1 py-2 text-sm rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium transition-colors">
                    Reject
                  </button>
                )}
                {nextStatus && (
                  <button onClick={() => updateOnlineOrderStatus(order.id, nextStatus)}
                    className="flex-1 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors">
                    {getActionLabel(order.status)}
                  </button>
                )}
                {order.status === 'delivered' && (
                  <span className="flex-1 py-2 text-sm text-center text-success font-medium">✓ Delivered</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineOrders;
