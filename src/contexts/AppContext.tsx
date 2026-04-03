import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  Table, Order, OnlineOrder, CartItem, MenuItem, OrderStatus, OnlineOrderStatus, MenuCategory,
  initialTables, initialOrders, initialOnlineOrders, menuItems, Waiter,
} from '@/data/mockData';
import { apiUrl } from '@/lib/api';

type UserRole = 'admin' | 'waiter';

interface AuthUser {
  role: UserRole;
  username: string;
  name: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  tables: Table[];
  orders: Order[];
  onlineOrders: OnlineOrder[];
  onlineOrdersLoading: boolean;
  menu: MenuItem[];
  notifications: string[];
  clearNotification: (index: number) => void;
  updateTableStatus: (tableId: number, status: Table['status']) => void;
  createOrder: (tableId: number, items: CartItem[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOnlineOrderStatus: (orderId: string, status: OnlineOrderStatus) => void;
  completePayment: (tableId: number) => void;
  waiters: Waiter[];
  updateTableSeats: (tableId: number, seats: number) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (itemId: string, updates: Partial<Omit<MenuItem, 'id'>>) => void;
  addWaiter: (name: string, username: string, password: string) => boolean;
  removeWaiter: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const POLL_INTERVAL = 3000;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('pos_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('pos_auth') === 'true');
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [orders, setOrders] = useState<Order[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(initialOnlineOrders);
  const [onlineOrdersLoading, setOnlineOrdersLoading] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('pos_menu');
    return saved ? JSON.parse(saved) : menuItems;
  });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>(() => {
    const saved = localStorage.getItem('pos_waiters');
    return saved ? JSON.parse(saved) : [];
  });

  // Track known order IDs for notifications
  const knownOrderIds = useRef<Set<string>>(new Set());

  // --- Fetch orders from MongoDB ---
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/orders'));
      if (!res.ok) return;
      const data: Order[] = await res.json();
      
      // Check for new orders to notify
      data.forEach(order => {
        if (!knownOrderIds.current.has(order.id) && order.status !== 'completed') {
          // Only notify if we already loaded once (not initial load)
          if (knownOrderIds.current.size > 0) {
            setNotifications(prev => [...prev, `New dine-in order ${order.id} for Table ${order.tableId}`]);
          }
        }
      });
      knownOrderIds.current = new Set(data.map(o => o.id));
      
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  }, []);

  // --- Fetch tables from MongoDB ---
  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/tables'));
      if (!res.ok) return;
      const data: Table[] = await res.json();
      if (data.length > 0) {
        setTables(data);
      }
    } catch (err) {
      console.error('Failed to fetch tables', err);
    }
  }, []);

  // --- Initial load + polling ---
  useEffect(() => {
    let mounted = true;
    
    const poll = async () => {
      if (!mounted) return;
      await Promise.all([fetchOrders(), fetchTables()]);
    };

    void poll();
    const interval = setInterval(poll, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchOrders, fetchTables]);

  useEffect(() => {
    localStorage.setItem('pos_waiters', JSON.stringify(waiters));
  }, [waiters]);

  useEffect(() => {
    localStorage.setItem('pos_menu', JSON.stringify(menu));
  }, [menu]);

  // --- Online orders fetch ---
  useEffect(() => {
    let mounted = true;

    const loadOnlineOrders = async () => {
      setOnlineOrdersLoading(true);
      try {
        const response = await fetch(apiUrl('/online-orders'));
        if (!response.ok) throw new Error('Failed to load online orders');
        const data: OnlineOrder[] = await response.json();
        if (mounted) setOnlineOrders(data);
      } catch (error) {
        console.error('Failed to fetch online orders', error);
        if (mounted) setOnlineOrders([]);
      } finally {
        if (mounted) setOnlineOrdersLoading(false);
      }
    };

    void loadOnlineOrders();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setIsAuthenticated(false);
      localStorage.removeItem('pos_auth');
      localStorage.removeItem('pos_auth_user');
      return;
    }
    setIsAuthenticated(true);
    localStorage.setItem('pos_auth', 'true');
    localStorage.setItem('pos_auth_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = useCallback((username: string, password: string) => {
    if (username === 'sairohit45' && password === '453123') {
      setCurrentUser({ role: 'admin', username, name: 'Admin' });
      return true;
    }
    const matchedWaiter = waiters.find(waiter => waiter.username === username && waiter.password === password);
    if (matchedWaiter) {
      setCurrentUser({ role: 'waiter', username: matchedWaiter.username, name: matchedWaiter.name });
      return true;
    }
    return false;
  }, [waiters]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('pos_auth');
    localStorage.removeItem('pos_auth_user');
  }, []);

  const updateTableStatus = useCallback((tableId: number, status: Table['status']) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    void fetch(apiUrl(`/tables/${tableId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(err => console.error('Failed to update table status', err));
  }, []);

  const updateTableSeats = useCallback((tableId: number, seats: number) => {
    if (seats < 1) return;
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, seats } : t));
    void fetch(apiUrl(`/tables/${tableId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seats }),
    }).catch(err => console.error('Failed to update table seats', err));
  }, []);

  const createOrder = useCallback((tableId: number, items: CartItem[]) => {
    const activeOrder = orders.find(order => order.tableId === tableId && order.status !== 'completed');
    if (activeOrder) return;

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order: Order = {
      id: `ORD${String(Date.now()).slice(-6)}`,
      tableId,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setOrders(prev => [...prev, order]);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied' as const, orderId: order.id } : t));
    setNotifications(prev => [...prev, `New dine-in order ${order.id} for Table ${tableId}`]);

    // Persist to MongoDB
    void fetch(apiUrl('/orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(err => console.error('Failed to save order', err));

    void fetch(apiUrl(`/tables/${tableId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'occupied', orderId: order.id }),
    }).catch(err => console.error('Failed to update table', err));
  }, [orders]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    void fetch(apiUrl(`/orders/${orderId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(err => console.error('Failed to update order status', err));
  }, []);

  const updateOnlineOrderStatus = useCallback((orderId: string, status: OnlineOrderStatus) => {
    setOnlineOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    void fetch(apiUrl(`/online-orders/${orderId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(error => console.error('Failed to update online order status', error));
  }, []);

  const completePayment = useCallback((tableId: number) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'available' as const, orderId: undefined } : t));
    
    // Find active order for this table and mark completed
    const activeOrder = orders.find(o => o.tableId === tableId && o.status !== 'completed');
    if (activeOrder) {
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'completed' as const } : o));
      void fetch(apiUrl(`/orders/${activeOrder.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      }).catch(err => console.error('Failed to complete order', err));
    }

    void fetch(apiUrl(`/tables/${tableId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'available', orderId: null }),
    }).catch(err => console.error('Failed to reset table', err));
  }, [orders]);

  const clearNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addWaiter = useCallback((name: string, username: string, password: string) => {
    const exists = waiters.some(w => w.username === username) || username === 'sairohit45';
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

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const nextItem: MenuItem = { ...item, id: `m${Date.now()}` };
    setMenu(prev => [...prev, nextItem]);
  }, []);

  const updateMenuItem = useCallback((itemId: string, updates: Partial<Omit<MenuItem, 'id'>>) => {
    setMenu(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
  }, []);

  return (
    <AppContext.Provider value={{
      isAuthenticated, currentUser, login, logout, tables, orders, onlineOrders, onlineOrdersLoading, menu,
      notifications, clearNotification, updateTableStatus, createOrder, updateOrderStatus,
      updateOnlineOrderStatus, completePayment, waiters, updateTableSeats, addMenuItem, updateMenuItem, addWaiter, removeWaiter,
    }}>
      {children}
    </AppContext.Provider>
  );
};
