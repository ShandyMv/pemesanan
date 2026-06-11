import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { routePaths } from '../../../app/routes/paths';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { PageLoader } from '../../../components/feedback/PageLoader';
import { formatCurrency } from '../../../lib/utils';
import { useCustomerOrder } from '../hooks/useCustomerOrder';

export function CartCheckoutPage() {
  const { tableId = '' } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { error, isLoading, isSaving, loadTable, tables, cartItems, updateCart, createOrder } = useCustomerOrder();
  const [customerName, setCustomerName] = useState('');
  const [submitError, setSubmitError] = useState('');
  const table = tables.find((item) => item.tableNumber === tableId || item.qrCode === tableId);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  useEffect(() => {
    void loadTable(tableId);
  }, [loadTable, tableId]);

  const handleConfirm = async () => {
    if (!table || cartItems.length === 0) return;

    try {
      const order = await createOrder({ tableNumber: table.tableNumber, customerName: customerName.trim() });
      navigate(routePaths.customer.order(order.publicToken));
    } catch {
      setSubmitError('Pesanan belum berhasil dikirim. Silakan coba lagi.');
    }
  };

  if (!table && isLoading) {
    return <PageLoader />;
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4 md:px-8">
          <Button
            as={Link}
            to={routePaths.customer.table(tableId)}
            variant="ghost"
            size="iconSm"
            className="-ml-2 mr-2"
            aria-label="Kembali ke menu"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Checkout</p>
            <h1 className="text-xl font-bold text-slate-950">Keranjang Pesanan</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:px-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          {!table ? (
            <Card className="p-5">
              <h2 className="text-lg font-bold text-slate-950">Meja tidak tersedia</h2>
              <p className="mt-2 text-sm text-slate-500">{error || 'Kode meja tidak valid atau sedang tidak aktif.'}</p>
            </Card>
          ) : null}
          {cartItems.length === 0 ? (
            <Card className="grid min-h-72 place-items-center p-8 text-center">
              <div>
                <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
                <h2 className="mt-4 text-xl font-bold text-slate-950">Keranjang kosong</h2>
                <p className="mt-2 text-sm text-slate-500">Pilih menu terlebih dahulu sebelum checkout.</p>
                <Button as={Link} to={routePaths.customer.table(tableId)} className="mt-5">
                  Pilih Menu
                </Button>
              </div>
            </Card>
          ) : (
            cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="grid grid-cols-[80px_1fr] gap-4">
                  <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-bold text-slate-950">{item.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">{formatCurrency(item.price)} per item</p>
                      </div>
                      <p className="shrink-0 font-bold text-slate-950">{formatCurrency(item.subtotal)}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="grid h-9 w-28 grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <Button
                          type="button"
                          onClick={() => updateCart(item.id, item.quantity - 1)}
                          variant="ghost"
                          size="none"
                          className="h-full w-full rounded-none text-slate-500 hover:bg-slate-100"
                          aria-label={`Kurangi ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="grid place-items-center border-x border-slate-200 text-sm font-bold">{item.quantity}</span>
                        <Button
                          type="button"
                          onClick={() => updateCart(item.id, item.quantity + 1)}
                          variant="ghost"
                          size="none"
                          className="h-full w-full rounded-none text-primary-700 hover:bg-primary-50"
                          aria-label={`Tambah ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        onClick={() => updateCart(item.id, 0)}
                        variant="dangerGhost"
                        size="sm"
                        className="gap-1 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Data Pemesan</h2>
            <label htmlFor="customer-name" className="mt-4 block text-sm font-semibold text-slate-700">Nama pemesan</label>
            <Input
              id="customer-name"
              className="mt-1.5"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Opsional"
            />
            <label htmlFor="table-number" className="mt-4 block text-sm font-semibold text-slate-700">Nomor meja</label>
            <Input id="table-number" className="mt-1.5" value={table?.tableNumber || tableId} disabled />
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Ringkasan</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jumlah item</span>
                <span className="font-semibold text-slate-950">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-950">Total</span>
                <span className="text-xl font-bold text-primary-700">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            {submitError ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{submitError}</p> : null}
          </Card>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <Button
            onClick={handleConfirm}
            disabled={!table || cartItems.length === 0 || isSaving}
            className="h-14 w-full rounded-xl md:ml-auto md:w-96"
          >
            {isSaving ? 'Mengirim pesanan...' : 'Konfirmasi Pesanan'}
          </Button>
        </div>
      </div>
    </main>
  );
}
