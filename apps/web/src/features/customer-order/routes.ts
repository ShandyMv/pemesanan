import { lazyRoute } from '../../app/routes/lazyRoute';

export const customerOrderRoutes = [
  {
    path: 't/:tableId',
    lazy: lazyRoute(() => import('./pages/MenuListPage'), 'MenuListPage'),
  },
  {
    path: 't/:tableId/cart',
    lazy: lazyRoute(() => import('./pages/CartCheckoutPage'), 'CartCheckoutPage'),
  },
  {
    path: 'order/:publicToken',
    lazy: lazyRoute(() => import('./pages/OrderSuccessPage'), 'OrderSuccessPage'),
  },
];
