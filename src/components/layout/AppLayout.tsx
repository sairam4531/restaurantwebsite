import { useState } from 'react';
import AppSidebar from './AppSidebar';
import TopNav from './TopNav';
import { cn } from '@/lib/utils';

const AppLayout = ({ children, role = 'admin' }: { children: React.ReactNode; role?: 'admin' | 'waiter' }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} role={role} />
      <div className={cn("transition-all duration-300", collapsed ? "ml-[70px]" : "ml-[240px]")}>
        <TopNav onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
