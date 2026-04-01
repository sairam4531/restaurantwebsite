import { useApp } from '@/contexts/AppContext';
import { CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Payments = () => {
  const { tables, orders, completePayment, onlineOrders } = useApp();
  const [completedPayments, setCompletedPayments] = useState<Set<number>>(new Set());

  const occupiedTables = tables.filter(t => t.status === 'occupied');

  const handlePayment = (tableId: number) => {
    completePayment(tableId);
    setCompletedPayments(prev => new Set(prev).add(tableId));
    setTimeout(() => {
      setCompletedPayments(prev => {
        const next = new Set(prev);
        next.delete(tableId);
        return next;
      });
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Payments</h1>

      {/* Dine-in */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Dine-in Bills</h2>
        {occupiedTables.length === 0 && !Array.from(completedPayments).length && (
          <p className="text-muted-foreground text-sm">No pending bills.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {occupiedTables.map(table => {
            const order = orders.find(o => o.tableId === table.id && o.status !== 'completed');
            if (!order) return null;
            return (
              <div key={table.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground text-lg">Table {table.number}</h3>
                  <span className="text-sm text-muted-foreground">{order.id}</span>
                </div>
                <div className="space-y-1.5 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                      <span className="text-foreground">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-foreground text-lg border-t border-border pt-3 mb-4">
                  <span>Total</span><span>₹{order.total}</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handlePayment(table.id)} className="flex-1 bg-primary text-primary-foreground gap-2">
                    <Banknote className="w-4 h-4" /> Cash
                  </Button>
                  <Button onClick={() => handlePayment(table.id)} variant="outline" className="flex-1 gap-2">
                    <CreditCard className="w-4 h-4" /> UPI/Card
                  </Button>
                </div>
              </div>
            );
          })}
          {Array.from(completedPayments).map(tableId => (
            <div key={`done-${tableId}`} className="glass-card p-5 border-success/30 bg-success/5">
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle className="w-12 h-12 text-success mb-3" />
                <p className="font-semibold text-success">Payment Complete!</p>
                <p className="text-sm text-muted-foreground">Table {tableId} is now available</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Online */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Online Order Payments</h2>
        {onlineOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No online orders yet.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {onlineOrders.slice(0, 6).map(order => (
            <div key={order.id} className="glass-card p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold uppercase",
                    order.platform === 'swiggy' ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                  )}>
                    {order.platform}
                  </span>
                  <span className="text-sm font-medium text-foreground">{order.id}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">₹{order.total}</p>
                <span className={cn(
                  "text-xs font-medium",
                  order.paymentType === 'prepaid' ? "text-success" : "text-warning"
                )}>
                  {order.paymentType === 'prepaid' ? '✓ Paid' : 'COD'}
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
