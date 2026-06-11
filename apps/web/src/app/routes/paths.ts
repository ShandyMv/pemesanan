import { appConfig } from '../config/app';

export const routePaths = {
  login: '/',
  defaultTable: `/t/${appConfig.defaultTableId}`,
  admin: {
    dashboard: '/admin',
    menus: '/admin/menus',
    categories: '/admin/categories',
    tables: '/admin/tables',
    reports: '/admin/reports',
  },
  cashier: {
    orders: '/cashier',
  },
  customer: {
    table: (tableId: string) => `/t/${tableId}`,
    cart: (tableId: string) => `/t/${tableId}/cart`,
    order: (publicToken: string) => `/order/${publicToken}`,
  },
};
