import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const categories = ['starters', 'main_course', 'drinks', 'desserts'] as const;
const categoryLabels: Record<string, string> = {
  starters: 'Starters',
  main_course: 'Main Course',
  drinks: 'Drinks',
  desserts: 'Desserts',
};

const MenuPage = () => {
  const { menu } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = menu.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>

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
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-4 h-4 rounded border-2", item.veg ? "border-success" : "border-destructive")}>
                <div className={cn("w-2 h-2 rounded-full m-0.5", item.veg ? "bg-success" : "bg-destructive")} />
              </div>
              <span className="text-xs text-muted-foreground capitalize">{categoryLabels[item.category]}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
            <p className="text-lg font-bold text-primary">₹{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
