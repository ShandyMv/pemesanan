import React, { useEffect, useState } from 'react';
import Barcode from 'react-barcode';
import type { BarcodeProps } from 'react-barcode';
import QRCode from 'react-qr-code';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, CreditCard, QrCode, Receipt, XCircle } from 'lucide-react';
import { routePaths } from '../../../app/routes/paths';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { PageLoader } from '../../../components/feedback/PageLoader';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { useCustomerOrder } from '../hooks/useCustomerOrder';

const BarcodeView = Barcode as unknown as React.ComponentType<BarcodeProps>;

// Status yang masih perlu dipantau (kafe belum selesai memproses / membayar).
const LIVE_STATUSES = new Set(['pending', 'awaiting_payment']);

export function OrderSuccessPage() {
  const { publicToken = '' } = useParams<{ publicToken: string }>();
  const { isLoading, isSaving, loadPublicOrder, payAtTable, orders } = useCustomerOrder();
  const order = orders.find((item) => item.publicToken === publicToken);
  const [showQr, setShowQr] = useState(false);
  const [payError, setPayError] = useState('');

  // Muat sekali saat masuk.
  useEffect(() => {
    void loadPublicOrder(publicToken);
  }, [loadPublicOrder, publicToken]);

  // Polling ringan agar HP customer tahu saat kafe menerima/menolak/menerima pembayaran.
  useEffect(() => {
    if (!order || !LIVE_STATUSES.has(order.status)) return;

    const timer = window.setInterval(() => {
      void loadPublicOrder(publicToken);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [loadPublicOrder, order, order?.status, publicToken]);

  const handlePayAtTable = async () => {
    setPayError('');
    const paid = await payAtTable(publicToken);
    if (!paid) {
      setPayError('Pembayaran belum berhasil. Silakan coba lagi.');
    }
  };

  if (!order && isLoading) {
    return <PageLoader />;
  }

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <Receipt className="mx-auto h-10 w-10 text-slate-300" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Order tidak ditemukan</h1>
          <p className="mt-2 text-sm text-slate-500">Kode order tidak tersedia.</p>
          <Button as={Link} to={routePaths.defaultTable} fullWidth className="mt-5">
            Kembali ke Menu
          </Button>
        </Card>
      </main>
    );
  }

  const headerByStatus = {
    pending: { icon: Clock, tone: 'text-amber-700 bg-amber-50', label: 'Pesanan diterima', sub: 'Menunggu konfirmasi ketersediaan dari kafe.' },
    awaiting_payment: { icon: CreditCard, tone: 'text-primary-700 bg-primary-50', label: 'Pesanan dikonfirmasi', sub: 'Silakan selesaikan pembayaran.' },
    paid: { icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50', label: 'Pembayaran berhasil', sub: 'Terima kasih, pesanan sedang disiapkan.' },
    rejected: { icon: XCircle, tone: 'text-rose-700 bg-rose-50', label: 'Pesanan ditolak', sub: order.rejectedReason || 'Menu tidak tersedia.' },
    cancelled: { icon: XCircle, tone: 'text-slate-700 bg-slate-100', label: 'Pesanan dibatalkan', sub: 'Pesanan ini telah dibatalkan.' },
  } as const;

  const head = headerByStatus[order.status];
  const HeadIcon = head.icon;

  const statusBadge =
    order.status === 'paid'
      ? { variant: 'success' as const, text: 'Lunas' }
      : order.status === 'awaiting_payment'
        ? { variant: 'default' as const, text: 'Siap Dibayar' }
        : order.status === 'rejected'
          ? { variant: 'destructive' as const, text: 'Ditolak' }
          : order.status === 'cancelled'
            ? { variant: 'destructive' as const, text: 'Dibatalkan' }
            : { variant: 'warning' as const, text: 'Menunggu Konfirmasi' };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <Card className="mx-auto w-full max-w-xl p-5">
        <div className="flex items-start gap-3">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${head.tone}`}>
            <HeadIcon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{head.label}</p>
            <h1 className="mt-1 truncate text-2xl font-bold text-slate-950">{order.orderCode}</h1>
            <p className="mt-1 text-sm text-slate-500">{head.sub}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Meja</p>
              <p className="text-lg font-bold text-slate-950">{order.tableNumber}</p>
            </div>
            <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium text-slate-500">Nama</p>
              <p className="font-semibold text-slate-950">{order.customerName}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Waktu</p>
              <p className="font-semibold text-slate-950">{formatDateTime(order.orderedAt)}</p>
            </div>
          </div>
        </div>

        {/* Pembayaran mandiri di meja (cashless) hanya saat pesanan sudah dikonfirmasi kafe. */}
        {order.status === 'awaiting_payment' ? (
          <div className="mt-5 rounded-xl border border-primary-200 bg-primary-50/60 p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Bayar di Meja (Non Tunai)</p>
            {!showQr ? (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  Bayar langsung dari meja tanpa antre ke kasir. Atau bila ingin tunai, cukup tunjukkan barcode di bawah ke kasir.
                </p>
                <Button onClick={() => setShowQr(true)} fullWidth className="mt-4 h-12">
                  <QrCode className="mr-2 h-5 w-5" /> Bayar Sekarang via QRIS
                </Button>
              </>
            ) : (
              <div className="mt-3 flex flex-col items-center">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <QRCode value={`QRIS|${order.orderCode}|${order.totalAmount}`} size={176} />
                </div>
                <p className="mt-3 text-center text-sm text-slate-600">
                  Pindai QRIS dengan aplikasi e-wallet / m-banking Anda, lalu tekan tombol di bawah setelah pembayaran berhasil.
                </p>
                <Button onClick={handlePayAtTable} fullWidth disabled={isSaving} className="mt-4 h-12">
                  {isSaving ? 'Memproses…' : 'Saya Sudah Bayar'}
                </Button>
                {payError ? <p className="mt-3 w-full rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{payError}</p> : null}
              </div>
            )}
          </div>
        ) : null}

        {/* Barcode untuk jalur tunai di kasir; disembunyikan jika sudah ditolak. */}
        {order.status !== 'rejected' && order.status !== 'cancelled' ? (
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
            <p className="mb-2 text-center text-xs font-medium text-slate-500">
              {order.status === 'paid' ? 'Barcode pesanan' : 'Tunjukkan barcode ini bila ingin bayar tunai di kasir'}
            </p>
            <BarcodeView value={order.orderCode} height={74} width={1.55} fontSize={14} margin={8} />
          </div>
        ) : null}

        <div className="mt-5 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">{item.menuName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-slate-950">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
          <span className="text-sm font-medium text-slate-500">{order.status === 'paid' ? 'Total dibayar' : 'Total'}</span>
          <span className="text-2xl font-bold text-primary-700">{formatCurrency(order.totalAmount)}</span>
        </div>

        <Button as={Link} to={routePaths.customer.table(order.tableNumber)} variant="outline" fullWidth className="mt-6 h-12">
          Kembali ke Menu
        </Button>
      </Card>
    </main>
  );
}
