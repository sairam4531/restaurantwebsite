import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Edit3, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MenuCategory } from '@/data/mockData';

const categories = ['starters', 'main_course', 'drinks', 'desserts'] as const;
const categoryLabels: Record<string, string> = {
  starters: 'Starters',
  main_course: 'Main Course',
  drinks: 'Drinks',
  desserts: 'Desserts',
};

const MenuPage = () => {
  const { menu, addMenuItem, updateMenuItem, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [form, setForm] = useState({ name: '', price: '', category: 'starters' as MenuCategory, veg: true, available: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = menu.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const resetForm = () => {
    setForm({ name: '', price: '', category: 'starters', veg: true, available: true });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price) return;
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      veg: form.veg,
      available: form.available,
    };
    if (editingId) updateMenuItem(editingId, payload);
    else addMenuItem(payload);
    resetForm();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>

      {currentUser?.role === 'admin' && (
        <div className="glass-card p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Item name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            <Input placeholder="Price" inputMode="numeric" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} />
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value as MenuCategory }))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {categories.map(cat => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
            </select>
            <Button onClick={handleSubmit} className="gap-2">
              <Plus className="w-4 h-4" /> {editingId ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-foreground">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.veg} onChange={e => setForm(prev => ({ ...prev, veg: e.target.checked }))} /> Veg</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.available} onChange={e => setForm(prev => ({ ...prev, available: e.target.checked }))} /> Available</label>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeCategory === 'all' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >{categoryLabels[cat]}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="glass-card p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded border-2", item.veg ? "border-success" : "border-destructive")}>
                <div className={cn("w-2 h-2 rounded-full m-0.5", item.veg ? "bg-success" : "bg-destructive")} />
              </div>
              <span className="text-xs text-muted-foreground capitalize">{categoryLabels[item.category]}</span>
              </div>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setForm({
                      name: item.name,
                      price: String(item.price),
                      category: item.category,
                      veg: item.veg,
                      available: item.available,
                    });
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
            <p className="text-lg font-bold text-primary">₹{item.price}</p>
            <p className={cn("text-xs mt-2 font-medium", item.available ? "text-success" : "text-destructive")}>{item.available ? 'Available' : 'Out of stock'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
