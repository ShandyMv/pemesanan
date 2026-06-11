import React from 'react';
import { DollarSign, ShoppingBag, Table2, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { PageLoader } from '../../../components/feedback/PageLoader';
import { formatCurrency, formatDateTime, toDateInputValue } from '../../../lib/utils';
import { useAdminData } from '../hooks/useAdminData';
import type { OrderStatus } from '../../../types/domain';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Belum bayar',
  awaiting_payment: 'Menunggu bayar',
  paid: 'Lunas',
  rejected: 'Ditolak',
  cancelled: 'Batal',
};

export function AdminDashboardPage() {
  const { error, isLoading, orders, menus, tables } = useAdminData();
  const paidOrders = orders.filter((order) => order.status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const availableMenus = menus.filter((menu) => menu.isAvailable).length;
  const activeTables = tables.filter((table) => table.isActive).length;

  const stats = [
    { title: 'Pendapatan Lunas', value: formatCurrency(totalRevenue), icon: DollarSign, tone: 'bg-emerald-50 text-emerald-700' },
    { title: 'Belum Dibayar', value: pendingOrders, icon: ShoppingBag, tone: 'bg-amber-50 text-amber-700' },
    { title: 'Menu Tersedia', value: availableMenus, icon: UtensilsCrossed, tone: 'bg-primary-50 text-primary-700' },
    { title: 'Meja Aktif', value: activeTables, icon: Table2, tone: 'bg-slate-100 text-slate-700' },
  ];

  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = toDateInputValue(date);
    const value = paidOrders
      .filter((order) => toDateInputValue(order.orderedAt) === key)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      key,
      label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
      value,
    };
  });
  const maxChartValue = Math.max(...chartData.map((item) => item.value), 1);

  if (isLoading && menus.length === 0 && tables.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-5">
      {error ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </Card>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-2 truncate text-2xl font-bold text-slate-950">{stat.value}</p>
              </div>
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Ringkasan</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Pendapatan 7 Hari Terakhir</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-primary-700" />
          </div>
          <div className="mt-6 flex h-64 items-end gap-3 rounded-xl bg-slate-50 p-4">
            {chartData.map((item) => (
              <div key={item.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-48 w-full items-end rounded-lg bg-white">
                  <div
                    className="w-full rounded-lg bg-primary-500"
                    style={{ height: `${item.value ? Math.max((item.value / maxChartValue) * 100, 8) : 2}%` }}
                    aria-label={`Pendapatan ${item.label}: ${formatCurrency(item.value)}`}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">Transaksi Terbaru</h2>
            <Badge variant="secondary">{orders.length} order</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">{order.orderCode}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.tableNumber} - {formatDateTime(order.orderedAt)}
                    </p>
                  </div>
                  <Badge variant={order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'destructive'}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <p className="mt-3 text-right font-bold text-primary-700">{formatCurrency(order.totalAmount)}</p>
              </div>
            ))}
            {orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-medium text-slate-500">
                Belum ada transaksi.
              </div>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
