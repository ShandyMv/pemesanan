import type { LucideIcon } from 'lucide-react';

export type Role = 'admin' | 'cashier';

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: Role;
  accessToken: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Menu {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CafeTable {
  id: number;
  tableNumber: string;
  qrCode: string;
  qrUrl: string;
  isActive: boolean;
}

export type OrderStatus = 'pending' | 'awaiting_payment' | 'paid' | 'rejected' | 'cancelled';
export type PaymentMethod = 'cash' | 'cashless';
export type PaymentChannel = 'cashier' | 'self_table';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed';

export interface OrderItem {
  id: number;
  menuName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  orderId: number;
  cashierName: string;
  cashierEmail: string | null;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  paymentChannel: PaymentChannel;
  amountPaid: number;
  changeAmount: number;
  paymentStatus: PaymentStatus;
  paidAt: string;
}

export interface Order {
  id: number;
  orderCode: string;
  publicToken: string;
  tableNumber: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  rejectedReason: string | null;
  orderedAt: string;
  paidAt: string | null;
  payment?: Payment;
  items: OrderItem[];
}

export type Cart = Record<number, number>;

export interface CartItem extends Menu {
  quantity: number;
  subtotal: number;
}

export interface CreateOrderPayload {
  tableNumber: string;
  customerName?: string;
}

export interface PaymentPayload {
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CategoryPayload {
  id?: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface MenuPayload {
  id?: number;
  categoryId: string | number;
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface TablePayload {
  id?: number;
  tableNumber: string;
  qrCode?: string;
  qrUrl?: string;
  isActive: boolean;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface CafeContextValue {
  categories: Category[];
  menus: Menu[];
  tables: CafeTable[];
  orders: Order[];
  cart: Cart;
  cartItems: CartItem[];
  session: UserSession | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  login: (payload: LoginPayload) => Promise<UserSession>;
  logout: () => void;
  clearError: () => void;
  refreshAdminData: () => Promise<void>;
  refreshCashierOrders: () => Promise<void>;
  loadTable: (tableCode: string) => Promise<CafeTable | null>;
  loadOrder: (orderCode: string) => Promise<Order | null>;
  loadPublicOrder: (publicToken: string) => Promise<Order | null>;
  updateCart: (menuId: number, quantity: number) => void;
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  payAtTable: (publicToken: string) => Promise<Order | null>;
  confirmPayment: (orderId: number, paymentPayload: PaymentPayload) => Promise<Order | null>;
  acceptOrder: (orderId: number) => Promise<Order | null>;
  rejectOrder: (orderId: number, reason: string) => Promise<Order | null>;
  upsertCategory: (payload: CategoryPayload) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  upsertMenu: (payload: MenuPayload) => Promise<void>;
  deleteMenu: (menuId: number) => Promise<void>;
  upsertTable: (payload: TablePayload) => Promise<void>;
}
