import { apiRequest } from './client';
import type {
  CafeTable,
  Category,
  CategoryPayload,
  Menu,
  MenuPayload,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentChannel,
  PaymentMethod,
  PaymentPayload,
  PaymentStatus,
  Role,
  TablePayload,
  UserSession,
} from '../../types/domain';

type BackendRecord = Record<string, any>;

interface LoginResponse {
  user: BackendRecord;
  accessToken: string;
}

interface CreateOrderRequest {
  tableCode: string;
  customerName?: string;
  items: Array<{
    menuId: number;
    quantity: number;
  }>;
}

interface ReportResponse {
  summary: {
    totalTransactions: number;
    paidTransactions: number;
    paidRevenue: number;
  };
  data: BackendRecord[];
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toRole(value: unknown): Role {
  return String(value).toLowerCase() === 'cashier' ? 'cashier' : 'admin';
}

function toOrderStatus(value: unknown): OrderStatus {
  const normalized = String(value).toLowerCase();
  if (normalized === 'paid') return 'paid';
  if (normalized === 'awaiting_payment') return 'awaiting_payment';
  if (normalized === 'rejected') return 'rejected';
  if (normalized === 'cancelled') return 'cancelled';
  return 'pending';
}

function toPaymentMethod(value: unknown): PaymentMethod {
  return String(value).toLowerCase() === 'cashless' ? 'cashless' : 'cash';
}

function toPaymentChannel(value: unknown): PaymentChannel {
  return String(value).toLowerCase() === 'self_table' ? 'self_table' : 'cashier';
}

function toPaymentStatus(value: unknown): PaymentStatus {
  return String(value).toLowerCase() === 'failed' ? 'failed' : 'paid';
}

function paymentLabel(method: PaymentMethod, channel: PaymentChannel) {
  if (channel === 'self_table') return 'Non Tunai (Bayar di Meja)';
  return method === 'cash' ? 'Tunai' : 'Non Tunai';
}

export function mapCategory(input: BackendRecord): Category {
  return {
    id: toNumber(input.id),
    name: String(input.name ?? ''),
    description: String(input.description ?? ''),
    isActive: Boolean(input.isActive),
  };
}

export function mapMenu(input: BackendRecord): Menu {
  return {
    id: toNumber(input.id),
    categoryId: toNumber(input.categoryId ?? input.category?.id),
    name: String(input.name ?? ''),
    description: String(input.description ?? ''),
    price: toNumber(input.price),
    imageUrl: String(input.imageUrl ?? ''),
    isAvailable: Boolean(input.isAvailable),
  };
}

export function mapTable(input: BackendRecord): CafeTable {
  return {
    id: toNumber(input.id),
    tableNumber: String(input.tableNumber ?? ''),
    qrCode: String(input.qrCode ?? ''),
    qrUrl: String(input.qrUrl ?? ''),
    isActive: Boolean(input.isActive),
  };
}

function mapPayment(input: BackendRecord): Payment {
  const method = toPaymentMethod(input.paymentMethod);
  const channel = toPaymentChannel(input.paymentChannel);

  return {
    id: toNumber(input.id),
    orderId: toNumber(input.orderId),
    cashierName: String(input.cashier?.name ?? (channel === 'self_table' ? 'Bayar di Meja' : 'Kasir')),
    cashierEmail: input.cashier?.email ? String(input.cashier.email) : null,
    paymentMethod: method,
    paymentMethodLabel: paymentLabel(method, channel),
    paymentChannel: channel,
    amountPaid: toNumber(input.amountPaid),
    changeAmount: toNumber(input.changeAmount),
    paymentStatus: toPaymentStatus(input.paymentStatus),
    paidAt: String(input.paidAt ?? ''),
  };
}

function mapOrderItem(input: BackendRecord): OrderItem {
  return {
    id: toNumber(input.id),
    menuName: String(input.menu?.name ?? input.menuName ?? 'Menu'),
    quantity: toNumber(input.quantity),
    price: toNumber(input.price),
    subtotal: toNumber(input.subtotal),
  };
}

export function mapOrder(input: BackendRecord): Order {
  return {
    id: toNumber(input.id),
    orderCode: String(input.orderCode ?? ''),
    publicToken: String(input.publicToken ?? ''),
    tableNumber: String(input.table?.tableNumber ?? input.tableNumber ?? ''),
    customerName: String(input.customerName ?? 'Customer'),
    totalAmount: toNumber(input.totalAmount),
    status: toOrderStatus(input.status),
    rejectedReason: input.rejectedReason ? String(input.rejectedReason) : null,
    orderedAt: String(input.orderedAt ?? ''),
    paidAt: input.paidAt ? String(input.paidAt) : null,
    payment: input.payment ? mapPayment(input.payment) : undefined,
    items: Array.isArray(input.items) ? input.items.map(mapOrderItem) : [],
  };
}

function categoriesFromMenus(inputs: BackendRecord[]) {
  const categories = new Map<number, Category>();

  inputs.forEach((menu) => {
    if (menu.category?.id) {
      const category = mapCategory(menu.category);
      categories.set(category.id, category);
    }
  });

  return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function toCategoryBody(payload: CategoryPayload) {
  return {
    name: payload.name,
    description: payload.description ?? '',
    isActive: payload.isActive ?? true,
  };
}

function toMenuBody(payload: MenuPayload) {
  return {
    categoryId: Number(payload.categoryId),
    name: payload.name,
    description: payload.description,
    price: Number(payload.price),
    imageUrl: payload.imageUrl,
    isAvailable: Boolean(payload.isAvailable),
  };
}

function toTableBody(payload: TablePayload) {
  return {
    tableNumber: payload.tableNumber,
    qrCode: payload.qrCode || undefined,
    isActive: payload.isActive,
  };
}

export const cafeApi = {
  async login(email: string, password: string): Promise<UserSession> {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    return {
      id: toNumber(response.user.id),
      name: String(response.user.name ?? ''),
      email: String(response.user.email ?? ''),
      role: toRole(response.user.role),
      accessToken: response.accessToken,
    };
  },

  async getPublicMenus() {
    const response = await apiRequest<BackendRecord[]>('/public/menus');

    return {
      categories: categoriesFromMenus(response),
      menus: response.map(mapMenu),
    };
  },

  async getPublicTable(code: string) {
    return mapTable(await apiRequest<BackendRecord>(`/public/tables/${encodeURIComponent(code)}`));
  },

  async createOrder(payload: CreateOrderRequest) {
    return mapOrder(await apiRequest<BackendRecord>('/orders', { method: 'POST', body: payload }));
  },

  async getOrder(orderCode: string) {
    return mapOrder(await apiRequest<BackendRecord>(`/orders/${encodeURIComponent(orderCode)}`));
  },

  async getPublicOrder(publicToken: string) {
    return mapOrder(await apiRequest<BackendRecord>(`/public/orders/${encodeURIComponent(publicToken)}`));
  },

  async payAtTable(publicToken: string) {
    return mapOrder(await apiRequest<BackendRecord>(`/public/orders/${encodeURIComponent(publicToken)}/pay`, {
      method: 'POST',
    }));
  },

  async getCashierOrders(token: string) {
    const response = await apiRequest<BackendRecord[]>('/cashier/orders', { token });
    return response.map(mapOrder);
  },

  async acceptOrder(token: string, orderId: number) {
    return mapOrder(await apiRequest<BackendRecord>(`/cashier/orders/${orderId}/accept`, {
      method: 'PATCH',
      token,
    }));
  },

  async rejectOrder(token: string, orderId: number, reason: string) {
    return mapOrder(await apiRequest<BackendRecord>(`/cashier/orders/${orderId}/reject`, {
      method: 'PATCH',
      token,
      body: { reason },
    }));
  },

  async confirmPayment(token: string, orderId: number, payload: PaymentPayload) {
    return mapOrder(await apiRequest<BackendRecord>(`/cashier/orders/${orderId}/pay`, {
      method: 'PATCH',
      token,
      body: {
        paymentMethod: payload.paymentMethod,
        amountPaid: payload.amountPaid,
      },
    }));
  },

  async getAdminCategories(token: string) {
    const response = await apiRequest<BackendRecord[]>('/admin/categories', { token });
    return response.map(mapCategory);
  },

  async upsertCategory(token: string, payload: CategoryPayload) {
    const path = payload.id ? `/admin/categories/${payload.id}` : '/admin/categories';
    const method = payload.id ? 'PATCH' : 'POST';

    return mapCategory(await apiRequest<BackendRecord>(path, {
      method,
      token,
      body: toCategoryBody(payload),
    }));
  },

  async deleteCategory(token: string, categoryId: number) {
    return mapCategory(await apiRequest<BackendRecord>(`/admin/categories/${categoryId}`, {
      method: 'DELETE',
      token,
    }));
  },

  async getAdminMenus(token: string) {
    const response = await apiRequest<BackendRecord[]>('/admin/menus', {
      token,
      query: { includeUnavailable: true },
    });
    return response.map(mapMenu);
  },

  async upsertMenu(token: string, payload: MenuPayload) {
    const path = payload.id ? `/admin/menus/${payload.id}` : '/admin/menus';
    const method = payload.id ? 'PATCH' : 'POST';

    return mapMenu(await apiRequest<BackendRecord>(path, {
      method,
      token,
      body: toMenuBody(payload),
    }));
  },

  async deleteMenu(token: string, menuId: number) {
    return mapMenu(await apiRequest<BackendRecord>(`/admin/menus/${menuId}`, {
      method: 'DELETE',
      token,
    }));
  },

  async getAdminTables(token: string) {
    const response = await apiRequest<BackendRecord[]>('/admin/tables', { token });
    return response.map(mapTable);
  },

  async upsertTable(token: string, payload: TablePayload) {
    const path = payload.id ? `/admin/tables/${payload.id}` : '/admin/tables';
    const method = payload.id ? 'PATCH' : 'POST';

    return mapTable(await apiRequest<BackendRecord>(path, {
      method,
      token,
      body: toTableBody(payload),
    }));
  },

  async getReportTransactions(token: string, query: { startDate?: string; endDate?: string } = {}) {
    const response = await apiRequest<ReportResponse>('/admin/reports/transactions', { token, query });

    return {
      summary: response.summary,
      orders: response.data.map(mapOrder),
    };
  },
};

export { getApiErrorMessage } from './client';
