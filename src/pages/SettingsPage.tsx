import { useApp } from '@/contexts/AppContext';
import { LogOut, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SettingsPage = () => {
  const { logout, currentUser } = useApp();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">The Grand Kitchen</h2>
            <p className="text-sm text-muted-foreground">
              {currentUser?.role === 'waiter' ? 'Waiter workspace' : 'Restaurant Management System'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Signed in as</span>
            <span className="text-foreground font-medium capitalize">{currentUser?.role ?? 'admin'}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Username</span>
            <span className="text-foreground font-medium">{currentUser?.username ?? 'sairohit45'}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Version</span>
            <span className="text-foreground font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Location</span>
            <span className="text-foreground font-medium">Bangalore, India</span>
          </div>
        </div>

        <Button onClick={logout} variant="outline" className="mt-6 gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
