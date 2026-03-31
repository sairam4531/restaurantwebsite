import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Table, Order, OnlineOrder, CartItem, MenuItem, OrderStatus, OnlineOrderStatus,
  initialTables, initialOrders, initialOnlineOrders, menuItems, Waiter,
} from '@/data/mockData';

interface AppContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  tables: Table[];
  orders: Order[];
  onlineOrders: OnlineOrder[];
  menu: MenuItem[];
  notifications: string[];
  clearNotification: (index: number) => void;
  updateTableStatus: (tableId: number, status: Table['status']) => void;
  createOrder: (tableId: number, items: CartItem[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOnlineOrderStatus: (orderId: string, status: OnlineOrderStatus) => void;
  completePayment: (tableId: number) => void;
  waiters: Waiter[];
  addWaiter: (name: string, username: string, password: string) => boolean;
  removeWaiter: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('pos_auth') === 'true');
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(initialOnlineOrders);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>(() => {
    const saved = localStorage.getItem('pos_waiters');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pos_waiters', JSON.stringify(waiters));
  }, [waiters]);

  const login = useCallback((username: string, password: string) => {
    if (username === 'sairohit45' && password === '453123') {
      setIsAuthenticated(true);
      localStorage.setItem('pos_auth', 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('pos_auth');
  }, []);

  const updateTableStatus = useCallback((tableId: number, status: Table['status']) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  }, []);

  const createOrder = useCallback((tableId: number, items: CartItem[]) => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order: Order = {
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      tableId,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [...prev, order]);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied' as const, orderId: order.id } : t));
    setNotifications(prev => [...prev, `New dine-in order ${order.id} for Table ${tableId}`]);
  }, [orders.length]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const updateOnlineOrderStatus = useCallback((orderId: string, status: OnlineOrderStatus) => {
    setOnlineOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const completePayment = useCallback((tableId: number) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'available' as const, orderId: undefined } : t));
    setOrders(prev => prev.map(o => o.tableId === tableId && o.status !== 'completed' ? { ...o, status: 'completed' as const } : o));
  }, []);

  const clearNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addWaiter = useCallback((name: string, username: string, password: string) => {
    const exists = waiters.some(w => w.username === username);
    if (exists) return false;
    const waiter: Waiter = {
      id: `W${Date.now()}`,
      name,
      username,
      password,
      createdAt: new Date().toISOString(),
    };
    setWaiters(prev => [...prev, waiter]);
    return true;
  }, [waiters]);

  const removeWaiter = useCallback((id: string) => {
    setWaiters(prev => prev.filter(w => w.id !== id));
  }, []);

  // Simulate new online order every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      const platforms: Array<'swiggy' | 'zomato'> = ['swiggy', 'zomato'];
      const names = ['Vikram Singh', 'Neha Gupta', 'Arjun Mehta', 'Kavya Nair'];
      const newOrder: OnlineOrder = {
        id: `ONL${String(Date.now()).slice(-4)}`,
        platform: platforms[Math.floor(Math.random() * 2)],
        customerName: names[Math.floor(Math.random() * names.length)],
        customerAddress: `${Math.floor(Math.random() * 999)}, Random Street, Bangalore`,
        items: [{ name: 'Biryani', quantity: 1, price: 299 }],
        total: 299,
        paymentType: Math.random() > 0.5 ? 'prepaid' : 'cod',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setOnlineOrders(prev => [newOrder, ...prev]);
      setNotifications(prev => [...prev, `New ${newOrder.platform} order ${newOrder.id} from ${newOrder.customerName}`]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{
      isAuthenticated, login, logout, tables, orders, onlineOrders, menu: menuItems,
      notifications, clearNotification, updateTableStatus, createOrder, updateOrderStatus,
      updateOnlineOrderStatus, completePayment, waiters, addWaiter, removeWaiter,
    }}>
      {children}
    </AppContext.Provider>
  );
};
