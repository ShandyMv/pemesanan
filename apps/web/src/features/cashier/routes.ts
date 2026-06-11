import { lazyRoute } from '../../app/routes/lazyRoute';

export const cashierRoutes = [
  {
    path: 'cashier',
    lazy: lazyRoute(() => import('./pages/OrderListPage'), 'OrderListPage'),
  },
];
