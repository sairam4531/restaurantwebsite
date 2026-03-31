import { Bell, Menu, User, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  onToggleSidebar: () => void;
}

const TopNav = ({ onToggleSidebar }: Props) => {
  const { notifications, clearNotification } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-lg font-semibold text-foreground hidden sm:block">The Grand Kitchen</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-muted transition-colors relative"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-slide-up z-50">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No new notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 border-b border-border/50 hover:bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-sm text-foreground flex-1">{n}</p>
                      <button onClick={() => clearNotification(i)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground hidden md:block">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
