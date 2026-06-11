import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, Printer, ScanBarcode, Search, ThumbsUp, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { BadgeVariant } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { PageLoader } from '../../../components/feedback/PageLoader';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { PaymentForm } from '../components/PaymentForm';
import { ThermalReceipt } from '../components/ThermalReceipt';
import { useCashierOrders } from '../hooks/useCashierOrders';
import type { Order, OrderStatus, PaymentPayload } from '../../../types/domain';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Perlu Konfirmasi',
  awaiting_payment: 'Menunggu Bayar',
  paid: 'Lunas',
  rejected: 'Ditolak',
  cancelled: 'Batal',
};

const statusVariants: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  awaiting_payment: 'default',
  paid: 'success',
  rejected: 'destructive',
  cancelled: 'destructive',
};

export function OrderListPage() {
  const { acceptOrder, confirmPayment, error, isLoading, isSaving, orders, refreshCashierOrders, rejectOrder } = useCashierOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [scanValue, setScanValue] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    void refreshCashierOrders();
  }, [refreshCashierOrders]);

  // Polling ringan: pesanan baru & pesanan yang dibayar mandiri di meja ikut terpantau.
  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshCashierOrders();
    }, 8000);

    return () => window.clearInterval(timer);
  }, [refreshCashierOrders]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()),
    [orders],
  );

  const filteredOrders = sortedOrders.filter((order) => {
    const query = searchTerm.toLowerCase();
    return (
      order.orderCode.toLowerCase().includes(query) ||
      order.tableNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query)
    );
  });

  const pendingCount = orders.filter((order) => order.status === 'pending' || order.status === 'awaiting_payment').length;
  const paidCount = orders.filter((order) => order.status === 'paid').length;

  const openDetail = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  }, []);

  const handlePaymentSubmit = async (paymentPayload: PaymentPayload) => {
    if (!selectedOrder) return;

    const paidOrder = await confirmPayment(selectedOrder.id, paymentPayload);
    if (!paidOrder) return;

    setSelectedOrder(paidOrder);
    setReceiptOrder(paidOrder);
    setIsReceiptOpen(true);
  };

  const handleAccept = async () => {
    if (!selectedOrder) return;

    const acceptedOrder = await acceptOrder(selectedOrder.id);
    if (acceptedOrder) setSelectedOrder(acceptedOrder);
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    const rejectedOrder = await rejectOrder(selectedOrder.id, rejectReason.trim());
    if (!rejectedOrder) return;

    setSelectedOrder(rejectedOrder);
    setIsRejectOpen(false);
    setRejectReason('');
  };

  const handleLookupOrder = useCallback((code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    setScanValue(normalizedCode);
    setSearchTerm(normalizedCode);

    const found = orders.find((order) => order.orderCode.toUpperCase() === normalizedCode);
    if (!found) return false;

    openDetail(found);
    setIsScannerOpen(false);
    return true;
  }, [openDetail, orders]);

  if (isLoading && orders.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {error ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </Card>
      ) : null}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Pesanan Pending</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{pendingCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Pesanan Lunas</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{paidCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Total Order</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{orders.length}</p>
        </Card>
      </section>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-11 pl-10"
              placeholder="Cari order code, meja, atau nama"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Button className="h-11 w-full md:w-auto" onClick={() => setIsScannerOpen(true)}>
            <ScanBarcode className="mr-2 h-5 w-5" /> Scan Barcode
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Order</th>
                  <th className="px-4 py-3 font-bold">Meja</th>
                  <th className="px-4 py-3 font-bold">Total</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-950">{order.orderCode}</p>
                      <p className="text-xs text-slate-500">{order.customerName}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{order.tableNumber}</td>
                    <td className="px-4 py-3 font-bold text-primary-700">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge>
                      {order.payment ? (
                        <p className="mt-1 text-xs font-medium text-slate-500">{order.payment.paymentMethodLabel}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => openDetail(order)}>
                        <Eye className="mr-2 h-4 w-4" /> Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="grid min-h-48 place-items-center border-t border-slate-100 p-6 text-center text-sm font-medium text-slate-500">
              Order tidak ditemukan.
            </div>
          ) : null}
        </Card>

        <Card className="hidden p-5 lg:block">
          <h2 className="text-lg font-bold text-slate-950">Aktivitas Shift</h2>
          <div className="mt-4 space-y-3">
            {sortedOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-950">{order.orderCode}</p>
                  <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{order.tableNumber} - {formatCurrency(order.totalAmount)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail & Pembayaran" className="max-w-2xl">
        {selectedOrder ? (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order</p>
                <p className="font-bold text-slate-950">{selectedOrder.orderCode}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meja</p>
                <p className="font-bold text-slate-950">{selectedOrder.tableNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                <Badge variant={statusVariants[selectedOrder.status]}>{statusLabels[selectedOrder.status]}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 rounded-xl border border-slate-200 p-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-950">{item.quantity}x {item.menuName}</p>
                    <p className="mt-1 text-slate-500">{formatCurrency(item.price)} per item</p>
                  </div>
                  <p className="font-bold text-slate-950">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-sm font-semibold text-slate-500">Total</span>
              <span className="text-2xl font-bold text-primary-700">{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>

            {selectedOrder.status === 'pending' || selectedOrder.status === 'awaiting_payment' ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.status === 'pending' ? (
                    <Button type="button" variant="outline" className="h-11" onClick={handleAccept} disabled={isSaving}>
                      <ThumbsUp className="mr-2 h-4 w-4" /> Terima
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl bg-primary-50 px-3 text-center text-xs font-semibold text-primary-700">
                      Menunggu pelanggan bayar di meja
                    </div>
                  )}
                  <Button type="button" variant="dangerGhost" className="h-11" onClick={() => setIsRejectOpen(true)} disabled={isSaving}>
                    <XCircle className="mr-2 h-4 w-4" /> Tolak Pesanan
                  </Button>
                </div>
                <PaymentForm order={selectedOrder} onSubmit={handlePaymentSubmit} />
                {isSaving ? <p className="text-center text-sm font-semibold text-slate-500">Menyimpan...</p> : null}
              </>
            ) : selectedOrder.status === 'rejected' ? (
              <div className="flex items-center justify-center rounded-xl bg-rose-50 p-3 text-center text-sm font-semibold text-rose-700">
                <XCircle className="mr-2 h-5 w-5" /> Pesanan ditolak: {selectedOrder.rejectedReason || 'Menu tidak tersedia.'}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-700">
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Pesanan sudah lunas
                </div>
                {selectedOrder.payment ? (
                  <div className="grid gap-3 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metode</p>
                      <p className="mt-1 font-bold text-slate-950">{selectedOrder.payment.paymentMethodLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diterima</p>
                      <p className="mt-1 font-bold text-slate-950">{formatCurrency(selectedOrder.payment.amountPaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kembalian</p>
                      <p className="mt-1 font-bold text-slate-950">{formatCurrency(selectedOrder.payment.changeAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Waktu Bayar</p>
                      <p className="mt-1 font-bold text-slate-950">{formatDateTime(selectedOrder.payment.paidAt)}</p>
                    </div>
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => {
                    setReceiptOrder(selectedOrder);
                    setIsReceiptOpen(true);
                  }}
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Tampilkan Struk
                </Button>
              </div>
            )}

            <p className="text-xs text-slate-500">Waktu order: {formatDateTime(selectedOrder.orderedAt)}</p>
          </div>
        ) : null}
      </Modal>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        manualCode={scanValue}
        onClose={() => setIsScannerOpen(false)}
        onCodeChange={setScanValue}
        onLookup={handleLookupOrder}
      />

      <Modal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} title="Struk Pembayaran" className="max-w-md">
        {receiptOrder ? <ThermalReceipt order={receiptOrder} /> : null}
      </Modal>

      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Tolak Pesanan" className="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Tolak pesanan ini bila ada menu yang habis atau bentrok dengan kitchen/bar. Alasan akan terlihat oleh pelanggan.
          </p>
          <div>
            <label htmlFor="reject-reason" className="mb-1.5 block text-sm font-semibold text-slate-700">Alasan penolakan</label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Mis. Stok Matcha Latte habis"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => setIsRejectOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button type="button" variant="danger" className="h-11 flex-1" onClick={handleReject} disabled={isSaving}>
              {isSaving ? 'Memproses…' : 'Tolak Pesanan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
