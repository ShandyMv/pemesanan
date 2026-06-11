import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cafeApi, getApiErrorMessage } from '../api/cafeApi';
import type {
  CafeContextValue,
  Cart,
  CartItem,
  Category,
  CategoryPayload,
  CafeTable,
  CreateOrderPayload,
  LoginPayload,
  Menu,
  MenuPayload,
  Order,
  PaymentPayload,
  TablePayload,
  UserSession,
} from '../../types/domain';

const SESSION_STORAGE_KEY = 'cafe-tudo-session';

const CafeContext = createContext<CafeContextValue | null>(null);

function readStoredSession() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as UserSession;
    return session?.accessToken ? session : null;
  } catch {
    return null;
  }
}

function storeSession(session: UserSession | null) {
  if (typeof window === 'undefined') return;

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function upsertById<T extends { id: number }>(collection: T[], item: T) {
  const exists = collection.some((current) => current.id === item.id);
  return exists ? collection.map((current) => (current.id === item.id ? item : current)) : [...collection, item];
}

interface CafeProviderProps {
  children: React.ReactNode;
}

export function CafeProvider({ children }: CafeProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [session, setSession] = useState<UserSession | null>(() => readStoredSession());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const token = session?.accessToken ?? '';

  const clearError = useCallback(() => setError(''), []);

  const handleError = useCallback((errorValue: unknown, fallback?: string) => {
    const message = getApiErrorMessage(errorValue, fallback);
    setError(message);
    return message;
  }, []);

  const loadPublicCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const catalog = await cafeApi.getPublicMenus();
      setCategories(catalog.categories);
      setMenus(catalog.menus);
      setError('');
    } catch (errorValue) {
      handleError(errorValue, 'Menu belum dapat dimuat.');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const refreshAdminData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [nextCategories, nextMenus, nextTables, report] = await Promise.all([
        cafeApi.getAdminCategories(token),
        cafeApi.getAdminMenus(token),
        cafeApi.getAdminTables(token),
        cafeApi.getReportTransactions(token),
      ]);

      setCategories(nextCategories);
      setMenus(nextMenus);
      setTables(nextTables);
      setOrders(report.orders);
      setError('');
    } catch (errorValue) {
      handleError(errorValue, 'Data admin belum dapat dimuat.');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, token]);

  const refreshCashierOrders = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const nextOrders = await cafeApi.getCashierOrders(token);
      setOrders(nextOrders);
      setError('');
    } catch (errorValue) {
      handleError(errorValue, 'Daftar pesanan belum dapat dimuat.');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, token]);

  useEffect(() => {
    void loadPublicCatalog();
  }, [loadPublicCatalog]);

  useEffect(() => {
    if (!session?.accessToken) return;

    if (session.role === 'admin') {
      void refreshAdminData();
      return;
    }

    void refreshCashierOrders();
  }, [refreshAdminData, refreshCashierOrders, session?.accessToken, session?.role]);

  const cartItems = useMemo<CartItem[]>(() => {
    return Object.entries(cart).flatMap(([menuId, quantity]) => {
      const menu = menus.find((item) => item.id === Number(menuId));
      if (!menu) return [];

      return [{
        ...menu,
        quantity,
        subtotal: menu.price * quantity,
      }];
    });
  }, [cart, menus]);

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    setIsSaving(true);
    try {
      const nextSession = await cafeApi.login(email.trim(), password);
      setSession(nextSession);
      storeSession(nextSession);
      setError('');
      return nextSession;
    } catch (errorValue) {
      handleError(errorValue, 'Email atau password tidak sesuai.');
      throw errorValue;
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);

  const logout = useCallback(() => {
    setSession(null);
    storeSession(null);
    setOrders([]);
    setCart({});
    void loadPublicCatalog();
  }, [loadPublicCatalog]);

  const loadTable = useCallback(async (tableCode: string) => {
    const normalizedCode = tableCode.trim();
    if (!normalizedCode) return null;

    const existing = tables.find((item) => item.tableNumber === normalizedCode || item.qrCode === normalizedCode);
    if (existing) return existing;

    setIsLoading(true);
    try {
      const table = await cafeApi.getPublicTable(normalizedCode);
      setTables((current) => upsertById(current, table));
      setError('');
      return table;
    } catch (errorValue) {
      handleError(errorValue, 'Meja tidak ditemukan atau tidak aktif.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, tables]);

  const loadOrder = useCallback(async (orderCode: string) => {
    const normalizedCode = orderCode.trim();
    if (!normalizedCode) return null;

    const existing = orders.find((item) => item.orderCode === normalizedCode);
    if (existing) return existing;

    setIsLoading(true);
    try {
      const order = await cafeApi.getOrder(normalizedCode);
      setOrders((current) => upsertById(current, order));
      setError('');
      return order;
    } catch (errorValue) {
      handleError(errorValue, 'Order tidak ditemukan.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, orders]);

  const loadPublicOrder = useCallback(async (publicToken: string) => {
    const normalizedToken = publicToken.trim();
    if (!normalizedToken) return null;

    try {
      const order = await cafeApi.getPublicOrder(normalizedToken);
      setOrders((current) => upsertById(current, order));
      setError('');
      return order;
    } catch (errorValue) {
      handleError(errorValue, 'Order tidak ditemukan.');
      return null;
    }
  }, [handleError]);

  const updateCart = useCallback(
    (menuId: number, quantity: number) => {
      const menu = menus.find((item) => item.id === Number(menuId));
      if (!menu?.isAvailable && quantity > 0) return;

      setCart((current) => {
        const next = { ...current };
        if (quantity <= 0) {
          delete next[menuId];
        } else {
          next[menuId] = quantity;
        }
        return next;
      });
    },
    [menus],
  );

  const createOrder = useCallback(async ({ tableNumber, customerName }: CreateOrderPayload) => {
    if (!cartItems.length) {
      throw new Error('Keranjang masih kosong.');
    }

    setIsSaving(true);
    try {
      const order = await cafeApi.createOrder({
        tableCode: tableNumber,
        customerName: customerName?.trim() || undefined,
        items: cartItems.map((item) => ({
          menuId: item.id,
          quantity: item.quantity,
        })),
      });

      setOrders((current) => upsertById(current, order));
      setCart({});
      setError('');
      return order;
    } catch (errorValue) {
      handleError(errorValue, 'Pesanan belum dapat dibuat.');
      throw errorValue;
    } finally {
      setIsSaving(false);
    }
  }, [cartItems, handleError]);

  const payAtTable = useCallback(async (publicToken: string) => {
    setIsSaving(true);
    try {
      const paidOrder = await cafeApi.payAtTable(publicToken);
      setOrders((current) => upsertById(current, paidOrder));
      setError('');
      return paidOrder;
    } catch (errorValue) {
      handleError(errorValue, 'Pembayaran belum dapat diproses.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [handleError]);

  const confirmPayment = useCallback(async (orderId: number, paymentPayload: PaymentPayload) => {
    if (!token) return null;

    setIsSaving(true);
    try {
      const paidOrder = await cafeApi.confirmPayment(token, orderId, paymentPayload);
      setOrders((current) => upsertById(current, paidOrder));
      setError('');
      return paidOrder;
    } catch (errorValue) {
      handleError(errorValue, 'Pembayaran belum dapat dikonfirmasi.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, token]);

  const acceptOrder = useCallback(async (orderId: number) => {
    if (!token) return null;

    setIsSaving(true);
    try {
      const acceptedOrder = await cafeApi.acceptOrder(token, orderId);
      setOrders((current) => upsertById(current, acceptedOrder));
      setError('');
      return acceptedOrder;
    } catch (errorValue) {
      handleError(errorValue, 'Pesanan belum dapat dikonfirmasi.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, token]);

  const rejectOrder = useCallback(async (orderId: number, reason: string) => {
    if (!token) return null;

    setIsSaving(true);
    try {
      const rejectedOrder = await cafeApi.rejectOrder(token, orderId, reason);
      setOrders((current) => upsertById(current, rejectedOrder));
      setError('');
      return rejectedOrder;
    } catch (errorValue) {
      handleError(errorValue, 'Pesanan belum dapat ditolak.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, token]);

  const upsertCategory = useCallback(async (payload: CategoryPayload) => {
    if (!token) return;

    setIsSaving(true);
    try {
      const category = await cafeApi.upsertCategory(token, payload);
      setCategories((current) => upsertById(current, category));
      setError('');
    } catch (errorValue) {
      handleError(errorValue, 'Kategori belum dapat disimpan.');
      throw errorValue;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, token]);

  const deleteCategory = useCallback(async (categoryId: number) => {
    if (!token) return;

    setIsSaving(true);
    try {
      const category = await cafeApi.deleteCategory(token, categoryId);
      setCategories((current) => upsertById(current, category));
      setError('');
    } catch (errorValue) {
      handleError(errorValue, 'Kategori belum dapat dinonaktifkan.');
      throw errorValue;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, token]);

  const upsertMenu = useCallback(async (payload: MenuPayload) => {
    if (!token) return;

    setIsSaving(true);
    try {
      const menu = await cafeApi.upsertMenu(token, payload);
      setMenus((current) => upsertById(current, menu));
      setError('');
    } catch (errorValue) {
      handleError(errorValue, 'Menu belum dapat disimpan.');
      throw errorValue;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, token]);

  const deleteMenu = useCallback(async (menuId: number) => {
    if (!token) return;

    setIsSaving(true);
    try {
      const menu = await cafeApi.deleteMenu(token, menuId);
      setMenus((current) => upsertById(current, menu));
      setCart((current) => {
        const next = { ...current };
        delete next[menuId];
        return next;
      });
      setError('');
    } catch (errorValue) {
      handleError(errorValue, 'Menu belum dapat dinonaktifkan.');
      throw errorValue;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, token]);

  const upsertTable = useCallback(async (payload: TablePayload) => {
    if (!token) return;

    setIsSaving(true);
    try {
      const table = await cafeApi.upsertTable(token, payload);
      setTables((current) => upsertById(current, table));
      setError('');
    } catch (errorValue) {
      handleError(errorValue, 'Data meja belum dapat disimpan.');
      throw errorValue;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, token]);

  const value = useMemo<CafeContextValue>(
    () => ({
      categories,
      menus,
      tables,
      orders,
      cart,
      cartItems,
      session,
      isLoading,
      isSaving,
      error,
      login,
      logout,
      clearError,
      refreshAdminData,
      refreshCashierOrders,
      loadTable,
      loadOrder,
      loadPublicOrder,
      updateCart,
      createOrder,
      payAtTable,
      confirmPayment,
      acceptOrder,
      rejectOrder,
      upsertCategory,
      deleteCategory,
      upsertMenu,
      deleteMenu,
      upsertTable,
    }),
    [
      acceptOrder,
      cart,
      cartItems,
      categories,
      clearError,
      confirmPayment,
      createOrder,
      deleteCategory,
      deleteMenu,
      error,
      isLoading,
      isSaving,
      loadOrder,
      loadPublicOrder,
      loadTable,
      login,
      logout,
      menus,
      orders,
      payAtTable,
      refreshAdminData,
      refreshCashierOrders,
      rejectOrder,
      session,
      tables,
      updateCart,
      upsertCategory,
      upsertMenu,
      upsertTable,
    ],
  );

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used inside CafeProvider');
  }
  return context;
}
