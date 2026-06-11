import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RequireRole } from '../components/routing/RequireRole';
import { RouteErrorBoundary } from '../components/routing/RouteErrorBoundary';
import { adminRoutes } from '../features/admin/routes';
import { authRoutes } from '../features/auth/routes';
import { cashierRoutes } from '../features/cashier/routes';
import { customerOrderRoutes } from '../features/customer-order/routes';
import { adminNav, cashierNav } from './navigation';
import { routePaths } from './routes/paths';
import type { RouteObject } from 'react-router-dom';

function withRouteError(routes: RouteObject[]): RouteObject[] {
  return routes.map((route) => ({
    ...route,
    errorElement: route.errorElement ?? <RouteErrorBoundary />,
  }));
}

export const router = createBrowserRouter([
  ...withRouteError(authRoutes),
  {
    element: <CustomerLayout />,
    errorElement: <RouteErrorBoundary />,
    children: customerOrderRoutes,
  },
  {
    element: (
      <RequireRole role="cashier">
        <DashboardLayout navigation={cashierNav} title="Kasir" />
      </RequireRole>
    ),
    errorElement: <RouteErrorBoundary />,
    children: cashierRoutes,
  },
  {
    element: (
      <RequireRole role="admin">
        <DashboardLayout navigation={adminNav} title="Dashboard Admin" />
      </RequireRole>
    ),
    errorElement: <RouteErrorBoundary />,
    children: adminRoutes,
  },
  {
    path: '*',
    element: <Navigate to={routePaths.login} replace />,
  },
]);
