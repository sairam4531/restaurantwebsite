import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Grid3X3, ClipboardList, Globe, MapPin,
  BookOpen, CreditCard, Settings, LogOut, UtensilsCrossed, Users,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Tables', path: '/tables', icon: Grid3X3, roles: ['admin', 'waiter'] },
  { label: 'Orders', path: '/orders', icon: ClipboardList, roles: ['admin'] },
  { label: 'Online Orders', path: '/online-orders', icon: Globe, roles: ['admin'] },
  { label: 'Delivery Tracking', path: '/delivery', icon: MapPin, roles: ['admin'] },
  { label: 'Menu', path: '/menu', icon: BookOpen, roles: ['admin'] },
  { label: 'Waiters', path: '/waiters', icon: Users, roles: ['admin'] },
  { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['admin'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'waiter'] },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  role: 'admin' | 'waiter';
}

const AppSidebar = ({ collapsed, role }: Props) => {
  const location = useLocation();
  const { logout } = useApp();
  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-secondary flex flex-col z-40 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-secondary-foreground font-bold text-lg truncate">RestaurantOS</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {visibleItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
