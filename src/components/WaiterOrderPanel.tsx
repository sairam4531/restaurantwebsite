import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Plus, Minus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItem, MenuItem } from '@/data/mockData';
import { cn } from '@/lib/utils';

const categories = [
  { key: 'starters', label: 'Starters' },
  { key: 'main_course', label: 'Main Course' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'desserts', label: 'Desserts' },
] as const;

interface Props {
  tableId: number;
  onBack: () => void;
}

const WaiterOrderPanel = ({ tableId, onBack }: Props) => {
  const { menu, orders, createOrder, updateOrderStatus } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('starters');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');

  const existingOrder = orders.find(o => o.tableId === tableId && o.status !== 'completed');

  const filteredMenu = menu.filter(
    item => item.category === activeCategory &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    createOrder(tableId, cart);
    setCart([]);
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tables
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Table {tableId} — Order Panel</h1>
        {existingOrder && (
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold capitalize",
            existingOrder.status === 'pending' ? 'bg-warning/10 text-warning' :
            existingOrder.status === 'preparing' ? 'bg-primary/10 text-primary' :
            'bg-success/10 text-success'
          )}>
            {existingOrder.status}
          </span>
        )}
      </div>

      {existingOrder && (
        <div className="glass-card p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Current Order: {existingOrder.id}</h3>
          <div className="space-y-2 mb-4">
            {existingOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                <span className="text-foreground">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2">
            <span>Total</span><span>₹{existingOrder.total}</span>
          </div>
          <div className="flex gap-2 mt-4">
            {existingOrder.status === 'pending' && (
              <Button size="sm" onClick={() => updateOrderStatus(existingOrder.id, 'preparing')} className="bg-primary text-primary-foreground">
                Mark Preparing
              </Button>
            )}
            {existingOrder.status === 'preparing' && (
              <Button size="sm" onClick={() => updateOrderStatus(existingOrder.id, 'served')} className="bg-success text-success-foreground">
                Mark Served
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Menu */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenu.map(item => (
              <div key={item.id} className="glass-card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-sm border", item.veg ? "border-success bg-success/20" : "border-destructive bg-destructive/20")} />
                    <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                  </div>
                  <p className="text-primary font-semibold text-sm mt-1">₹{item.price}</p>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5 sticky top-24">
            <h3 className="font-semibold text-foreground mb-4">New Order Cart</h3>
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Add items to start an order</p>
            ) : (
              <>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center text-foreground">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-destructive hover:text-destructive/80 ml-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between font-semibold text-foreground mb-4">
                    <span>Total</span><span>₹{total}</span>
                  </div>
                  <Button onClick={handlePlaceOrder} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Place Order
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterOrderPanel;
