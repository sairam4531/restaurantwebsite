import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const statusSteps = ['pending', 'preparing', 'served', 'completed'] as const;

const Orders = () => {
  const { orders, updateOrderStatus } = useApp();
  const activeOrders = orders.filter(o => o.status !== 'completed');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Dine-in Orders</h1>

      {activeOrders.length === 0 && <p className="text-muted-foreground">No active orders.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeOrders.map(order => (
          <div key={order.id} className="glass-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">{order.id}</h3>
              <span className="text-sm text-muted-foreground">Table {order.tableId}</span>
            </div>
            <div className="space-y-1.5 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                  <span className="text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2 mb-4">
              <span>Total</span><span>₹{order.total}</span>
            </div>

            {/* Status bar */}
            <div className="flex gap-1 mb-4">
              {statusSteps.map((step, i) => (
                <div
                  key={step}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    statusSteps.indexOf(order.status) >= i ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {order.status === 'pending' && (
                <button onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Start Preparing
                </button>
              )}
              {order.status === 'preparing' && (
                <button onClick={() => updateOrderStatus(order.id, 'served')}
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-colors">
                  Mark Served
                </button>
              )}
              {order.status === 'served' && (
                <span className="flex-1 py-2 text-sm font-medium text-center text-success">✓ Served</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Completed ({completedOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-60">
            {completedOrders.slice(0, 6).map(order => (
              <div key={order.id} className="glass-card p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{order.id} — Table {order.tableId}</span>
                  <span className="text-success font-medium">₹{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
