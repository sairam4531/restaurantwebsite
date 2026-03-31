export type TableStatus = 'available' | 'occupied' | 'reserved';
export type OrderStatus = 'pending' | 'preparing' | 'served' | 'completed';
export type OnlineOrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';
export type Platform = 'swiggy' | 'zomato';
export type PaymentType = 'prepaid' | 'cod';

export interface Table {
  id: number;
  number: number;
  seats: number;
  status: TableStatus;
  orderId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'starters' | 'main_course' | 'drinks' | 'desserts';
  image?: string;
  veg: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tableId: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OnlineOrder {
  id: string;
  platform: Platform;
  customerName: string;
  customerAddress: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentType: PaymentType;
  status: OnlineOrderStatus;
  createdAt: string;
  deliveryPartnerId?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  currentLat: number;
  currentLng: number;
}

export const initialTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  seats: [2, 4, 4, 6, 2, 4, 8, 4, 2, 6, 4, 2][i],
  status: 'available' as TableStatus,
}));

export const menuItems: MenuItem[] = [
  { id: 'm1', name: 'Paneer Tikka', price: 249, category: 'starters', veg: true },
  { id: 'm2', name: 'Chicken Wings', price: 299, category: 'starters', veg: false },
  { id: 'm3', name: 'Spring Rolls', price: 179, category: 'starters', veg: true },
  { id: 'm4', name: 'Fish Fingers', price: 329, category: 'starters', veg: false },
  { id: 'm5', name: 'Butter Chicken', price: 349, category: 'main_course', veg: false },
  { id: 'm6', name: 'Dal Makhani', price: 249, category: 'main_course', veg: true },
  { id: 'm7', name: 'Biryani', price: 299, category: 'main_course', veg: false },
  { id: 'm8', name: 'Paneer Butter Masala', price: 279, category: 'main_course', veg: true },
  { id: 'm9', name: 'Naan', price: 49, category: 'main_course', veg: true },
  { id: 'm10', name: 'Mojito', price: 149, category: 'drinks', veg: true },
  { id: 'm11', name: 'Cold Coffee', price: 129, category: 'drinks', veg: true },
  { id: 'm12', name: 'Lassi', price: 99, category: 'drinks', veg: true },
  { id: 'm13', name: 'Fresh Lime Soda', price: 79, category: 'drinks', veg: true },
  { id: 'm14', name: 'Gulab Jamun', price: 99, category: 'desserts', veg: true },
  { id: 'm15', name: 'Ice Cream', price: 129, category: 'desserts', veg: true },
  { id: 'm16', name: 'Brownie', price: 149, category: 'desserts', veg: true },
];

export const initialOrders: Order[] = [];

export const initialOnlineOrders: OnlineOrder[] = [];

export interface Waiter {
  id: string;
  name: string;
  username: string;
  password: string;
  createdAt: string;
}

export const deliveryPartners: DeliveryPartner[] = [
  { id: 'dp1', name: 'Ravi Kumar', phone: '+91 98765 43210', currentLat: 12.9716, currentLng: 77.5946 },
  { id: 'dp2', name: 'Suresh Babu', phone: '+91 98765 43211', currentLat: 12.9352, currentLng: 77.6245 },
];

export const restaurantLocation = { lat: 12.9716, lng: 77.5946 };
