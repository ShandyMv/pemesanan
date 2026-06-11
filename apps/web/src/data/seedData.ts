import { appConfig } from '../app/config/app';
import type { CafeTable, Category, Menu, Order } from '../types/domain';

export const categories: Category[] = [
  { id: 1, name: 'Kopi', description: 'Espresso, kopi susu, dan signature coffee', isActive: true },
  { id: 2, name: 'Non-Kopi', description: 'Matcha, teh, cokelat, dan minuman segar', isActive: true },
  { id: 3, name: 'Snack', description: 'Menu ringan untuk menemani minuman', isActive: true },
  { id: 4, name: 'Makanan', description: `Menu utama ${appConfig.appName}`, isActive: true },
];

export const menus: Menu[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Espresso',
    description: 'Kopi hitam pekat dengan ekstraksi tinggi.',
    price: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=300&q=80',
    isAvailable: true,
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Cappuccino',
    description: 'Espresso dengan susu steamed dan busa tebal.',
    price: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=300&q=80',
    isAvailable: true,
  },
  {
    id: 3,
    categoryId: 2,
    name: 'Matcha Latte',
    description: 'Teh hijau bubuk kualitas premium dengan susu.',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=300&q=80',
    isAvailable: true,
  },
  {
    id: 4,
    categoryId: 3,
    name: 'Kentang Goreng',
    description: 'Kentang goreng renyah dengan taburan garam dan bumbu pilihan.',
    price: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1623101344464-9646b99e504c?auto=format&fit=crop&w=300&q=80',
    isAvailable: true,
  },
  {
    id: 5,
    categoryId: 3,
    name: 'Pisang Goreng Keju',
    description: 'Pisang goreng manis dengan taburan keju melimpah.',
    price: 20000,
    imageUrl: 'https://images.unsplash.com/photo-1604085449275-c081e69da598?auto=format&fit=crop&w=300&q=80',
    isAvailable: false,
  },
  {
    id: 6,
    categoryId: 4,
    name: 'Rice Bowl Teriyaki',
    description: 'Nasi hangat, ayam teriyaki, telur, dan salad segar.',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=300&q=80',
    isAvailable: true,
  },
  {
    id: 7,
    categoryId: 4,
    name: 'Spaghetti Aglio Olio',
    description: 'Pasta dengan bawang putih, olive oil, dan chili flakes.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&q=80',
    isAvailable: true,
  },
  {
    id: 8,
    categoryId: 2,
    name: 'Lemon Tea',
    description: 'Teh hitam dingin dengan lemon segar.',
    price: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=300&q=80',
    isAvailable: true,
  },
];

function createTable(id: number, tableNumber: string, isActive = true): CafeTable {
  return {
    id,
    tableNumber,
    qrCode: `${appConfig.qrCodePrefix}-${tableNumber}`,
    qrUrl: `/t/${tableNumber}`,
    isActive,
  };
}

export const tables: CafeTable[] = [
  createTable(1, appConfig.defaultTableId),
  createTable(2, 'M-02'),
  createTable(3, 'M-03'),
  createTable(4, 'M-04', false),
];

export const orders: Order[] = [
  {
    id: 1,
    orderCode: `${appConfig.orderCodePrefix}-1001`,
    publicToken: 'seed-token-1001',
    tableNumber: appConfig.defaultTableId,
    customerName: 'Budi',
    totalAmount: 43000,
    status: 'pending',
    rejectedReason: null,
    orderedAt: '2026-05-19T10:00:00+07:00',
    paidAt: null,
    items: [
      { id: 1, menuName: 'Cappuccino', quantity: 1, price: 25000, subtotal: 25000 },
      { id: 2, menuName: 'Kentang Goreng', quantity: 1, price: 18000, subtotal: 18000 },
    ]
  },
  {
    id: 2,
    orderCode: `${appConfig.orderCodePrefix}-1002`,
    publicToken: 'seed-token-1002',
    tableNumber: 'M-02',
    customerName: 'Andi',
    totalAmount: 28000,
    status: 'paid',
    rejectedReason: null,
    orderedAt: '2026-05-19T09:30:00+07:00',
    paidAt: '2026-05-19T09:42:00+07:00',
    payment: {
      id: 1,
      orderId: 2,
      cashierName: appConfig.demoUsers.cashier.name,
      cashierEmail: appConfig.demoUsers.cashier.email,
      paymentMethod: 'cash',
      paymentMethodLabel: 'Tunai',
      paymentChannel: 'cashier',
      amountPaid: 30000,
      changeAmount: 2000,
      paymentStatus: 'paid',
      paidAt: '2026-05-19T09:42:00+07:00',
    },
    items: [
      { id: 3, menuName: 'Matcha Latte', quantity: 1, price: 28000, subtotal: 28000 },
    ]
  },
  {
    id: 3,
    orderCode: `${appConfig.orderCodePrefix}-1003`,
    publicToken: 'seed-token-1003',
    tableNumber: 'M-03',
    customerName: 'Rara',
    totalAmount: 60000,
    status: 'paid',
    rejectedReason: null,
    orderedAt: '2026-05-18T19:15:00+07:00',
    paidAt: '2026-05-18T19:24:00+07:00',
    payment: {
      id: 2,
      orderId: 3,
      cashierName: appConfig.demoUsers.cashier.name,
      cashierEmail: appConfig.demoUsers.cashier.email,
      paymentMethod: 'cashless',
      paymentMethodLabel: 'Non Tunai',
      paymentChannel: 'cashier',
      amountPaid: 60000,
      changeAmount: 0,
      paymentStatus: 'paid',
      paidAt: '2026-05-18T19:24:00+07:00',
    },
    items: [
      { id: 4, menuName: 'Rice Bowl Teriyaki', quantity: 1, price: 42000, subtotal: 42000 },
      { id: 5, menuName: 'Lemon Tea', quantity: 1, price: 18000, subtotal: 18000 },
    ]
  }
];
