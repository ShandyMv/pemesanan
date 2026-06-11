import React, { useMemo, useState } from 'react';
import { Download, Eye, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency, formatDateTime, isWithinDateRange, toDateInputValue } from '../../../lib/utils';
import { useAdminData } from '../hooks/useAdminData';
import type { Order, OrderStatus } from '../../../types/domain';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Belum bayar',
  awaiting_payment: 'Menunggu bayar',
  paid: 'Lunas',
  rejected: 'Ditolak',
  cancelled: 'Batal',
};

export function AdminReportsPage() {
  const { error, orders } = useAdminData();
  const today = toDateInputValue();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => isWithinDateRange(order.orderedAt, startDate, endDate));
  }, [endDate, orders, startDate]);

  const paidRevenue = filteredOrders
    .filter((order) => order.status === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const handleDownload = () => {
    const rows = [
      ['Tanggal', 'Order Code', 'Meja', 'Nama', 'Total', 'Pembayaran', 'Status'],
      ...filteredOrders.map((order) => [
        formatDateTime(order.orderedAt),
        order.orderCode,
        order.tableNumber,
        order.customerName,
        String(order.totalAmount),
        order.payment?.paymentMethodLabel || '-',
        statusLabels[order.status],
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-transaksi-${startDate}-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Laporan Transaksi</h2>
            <p className="mt-1 text-sm text-slate-500">Filter laporan harian atau berdasarkan periode tanggal.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] lg:w-[560px]">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Dari</label>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Sampai</label>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
            <Button type="button" variant="outline" className="h-10 self-end" onClick={handleDownload} disabled={filteredOrders.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Unduh
            </Button>
          </div>
        </div>
        {error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Total Transaksi</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{filteredOrders.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Transaksi Lunas</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{filteredOrders.filter((order) => order.status === 'paid').length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Pendapatan Lunas</p>
          <p className="mt-2 text-2xl font-bold text-primary-700">{formatCurrency(paidRevenue)}</p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          <Filter className="h-4 w-4" />
          {startDate} sampai {endDate}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold">Order Code</th>
                <th className="px-4 py-3 font-bold">Meja</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Pembayaran</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(order.orderedAt)}</td>
                  <td className="px-4 py-3 font-bold text-slate-950">{order.orderCode}</td>
                  <td className="px-4 py-3 text-slate-600">{order.tableNumber}</td>
                  <td className="px-4 py-3 font-bold text-primary-700">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-slate-600">{order.payment?.paymentMethodLabel || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'destructive'}>
                      {statusLabels[order.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="mr-2 h-4 w-4" /> Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="grid min-h-48 place-items-center p-6 text-center text-sm font-medium text-slate-500">
            Tidak ada transaksi pada periode ini.
          </div>
        ) : null}
      </Card>

      <Modal isOpen={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} title="Detail Transaksi" className="max-w-xl">
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order Code</p>
                  <p className="font-bold text-slate-950">{selectedOrder.orderCode}</p>
                </div>
                <Badge variant={selectedOrder.status === 'paid' ? 'success' : selectedOrder.status === 'pending' ? 'warning' : 'destructive'}>
                  {statusLabels[selectedOrder.status]}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {selectedOrder.tableNumber} - {selectedOrder.customerName} - {formatDateTime(selectedOrder.orderedAt)}
              </p>
            </div>

            {selectedOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 rounded-xl border border-slate-200 p-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-950">{item.quantity}x {item.menuName}</p>
                  <p className="mt-1 text-slate-500">{formatCurrency(item.price)} per item</p>
                </div>
                <p className="font-bold text-slate-950">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="font-semibold text-slate-500">Total</span>
              <span className="text-2xl font-bold text-primary-700">{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>

            {selectedOrder.payment ? (
              <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metode Pembayaran</p>
                  <p className="mt-1 font-bold text-slate-950">{selectedOrder.payment.paymentMethodLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nominal Diterima</p>
                  <p className="mt-1 font-bold text-slate-950">{formatCurrency(selectedOrder.payment.amountPaid)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kembalian</p>
                  <p className="mt-1 font-bold text-slate-950">{formatCurrency(selectedOrder.payment.changeAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kasir</p>
                  <p className="mt-1 font-bold text-slate-950">{selectedOrder.payment.cashierName}</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
