import { FileText, Grid, LayoutDashboard, ShoppingBag, Table2, UtensilsCrossed } from 'lucide-react';
import { routePaths } from './routes/paths';

export const adminNav = [
  { name: 'Dashboard', href: routePaths.admin.dashboard, icon: LayoutDashboard },
  { name: 'Menu', href: routePaths.admin.menus, icon: UtensilsCrossed },
  { name: 'Kategori', href: routePaths.admin.categories, icon: Grid },
  { name: 'Meja & QR', href: routePaths.admin.tables, icon: Table2 },
  { name: 'Laporan', href: routePaths.admin.reports, icon: FileText },
];

export const cashierNav = [
  { name: 'Pesanan', href: routePaths.cashier.orders, icon: ShoppingBag },
];
