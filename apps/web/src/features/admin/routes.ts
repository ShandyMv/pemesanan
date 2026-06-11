import { lazyRoute } from '../../app/routes/lazyRoute';

export const adminRoutes = [
  {
    path: 'admin',
    lazy: lazyRoute(() => import('./pages/AdminDashboardPage'), 'AdminDashboardPage'),
  },
  {
    path: 'admin/menus',
    lazy: lazyRoute(() => import('./pages/AdminMenusPage'), 'AdminMenusPage'),
  },
  {
    path: 'admin/categories',
    lazy: lazyRoute(() => import('./pages/AdminCategoriesPage'), 'AdminCategoriesPage'),
  },
  {
    path: 'admin/tables',
    lazy: lazyRoute(() => import('./pages/AdminTablesPage'), 'AdminTablesPage'),
  },
  {
    path: 'admin/reports',
    lazy: lazyRoute(() => import('./pages/AdminReportsPage'), 'AdminReportsPage'),
  },
];
