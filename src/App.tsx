import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Tables from "@/pages/Tables";
import Orders from "@/pages/Orders";
import OnlineOrders from "@/pages/OnlineOrders";
import DeliveryTracking from "@/pages/DeliveryTracking";
import MenuPage from "@/pages/MenuPage";
import Payments from "@/pages/Payments";
import SettingsPage from "@/pages/SettingsPage";
import WaitersPage from "@/pages/WaitersPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AdminRoutes = () => (
  <AppLayout role="admin">
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="tables" element={<Tables />} />
      <Route path="orders" element={<Orders />} />
      <Route path="online-orders" element={<OnlineOrders />} />
      <Route path="delivery" element={<DeliveryTracking />} />
      <Route path="menu" element={<MenuPage />} />
      <Route path="payments" element={<Payments />} />
      <Route path="waiters" element={<WaitersPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AppLayout>
);

const WaiterRoutes = () => (
  <AppLayout role="waiter">
    <Routes>
      <Route index element={<Navigate to="/tables" replace />} />
      <Route path="tables" element={<Tables />} />
      <Route path="orders" element={<Orders />} />
      <Route path="menu" element={<MenuPage />} />
      <Route path="payments" element={<Payments />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/tables" replace />} />
    </Routes>
  </AppLayout>
);

const ProtectedRoutes = () => {
  const { isAuthenticated, currentUser } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return currentUser?.role === 'waiter' ? <WaiterRoutes /> : <AdminRoutes />;
};

const AppRoutes = () => {
  const { isAuthenticated, currentUser } = useApp();
  const defaultRoute = currentUser?.role === 'waiter' ? '/tables' : '/';

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <Login />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
