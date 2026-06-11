import { lazyRoute } from '../../app/routes/lazyRoute';

export const authRoutes = [
  {
    path: '/',
    lazy: lazyRoute(() => import('./pages/LoginPage'), 'LoginPage'),
  },
];
