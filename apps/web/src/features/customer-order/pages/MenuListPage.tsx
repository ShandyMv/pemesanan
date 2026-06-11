import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, Minus, Plus, ShoppingCart, Store } from 'lucide-react';
import { appConfig } from '../../../app/config/app';
import { routePaths } from '../../../app/routes/paths';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { PageLoader } from '../../../components/feedback/PageLoader';
import { formatCurrency } from '../../../lib/utils';
import { useCustomerOrder } from '../hooks/useCustomerOrder';

export function MenuListPage() {
  const { tableId = '' } = useParams<{ tableId: string }>();
  const { categories, error, isLoading, loadTable, menus, tables, cart, cartItems, updateCart } = useCustomerOrder();
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    void loadTable(tableId);
  }, [loadTable, tableId]);

  const table = tables.find((item) => item.tableNumber === tableId || item.qrCode === tableId);
  const activeCategories = categories.filter((category) => category.isActive);
  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const category = categories.find((item) => item.id === menu.categoryId);
      const matchesCategory = activeCategory === 'all' || menu.categoryId === Number(activeCategory);
      return category?.isActive && menu.isAvailable && matchesCategory;
    });
  }, [activeCategory, categories, menus]);

  if (!table && isLoading) {
    return <PageLoader />;
  }

  if (!table || !table.isActive) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-600" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Meja tidak tersedia</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error || 'Kode QR tidak ditemukan atau meja sedang dinonaktifkan.'}
          </p>
          <Button as={Link} to={routePaths.defaultTable} fullWidth className="mt-5">
            Buka Meja {appConfig.defaultTableId}
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-700">
              <Store className="h-4 w-4" />
              {appConfig.appName}
            </p>
            <h1 className="mt-1 truncate text-xl font-bold text-slate-950 md:text-2xl">Pemesanan Meja {table.tableNumber}</h1>
          </div>
          <Badge variant="outline">{table.qrCode}</Badge>
        </div>
      </header>

      <section className="sticky top-[73px] z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-8 no-scrollbar">
          <Button
            type="button"
            onClick={() => setActiveCategory('all')}
            variant={activeCategory === 'all' ? 'primary' : 'muted'}
            className="h-10 shrink-0 px-4"
          >
            Semua
          </Button>
          {activeCategories.map((category) => (
            <Button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(String(category.id))}
              variant={activeCategory === String(category.id) ? 'primary' : 'muted'}
              className="h-10 shrink-0 px-4"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:grid-cols-2 md:px-8 lg:grid-cols-3">
        {filteredMenus.map((menu) => {
          const quantity = cart[menu.id] || 0;

          return (
            <Card key={menu.id} className="overflow-hidden">
              <div className="grid h-full grid-cols-[132px_1fr] sm:grid-cols-[150px_1fr]">
                <div className="relative min-h-36 bg-slate-200">
                  <img src={menu.imageUrl} alt={menu.name} className="h-full w-full object-cover" />
                  {!menu.isAvailable ? (
                    <div className="absolute inset-0 grid place-items-center bg-slate-950/55">
                      <Badge variant="destructive">Habis</Badge>
                    </div>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-col justify-between p-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-950">{menu.name}</h2>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{menu.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="font-bold text-primary-700">{formatCurrency(menu.price)}</p>
                    {quantity > 0 ? (
                      <div className="grid h-9 w-28 grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <Button
                          type="button"
                          onClick={() => updateCart(menu.id, quantity - 1)}
                          variant="ghost"
                          size="none"
                          className="h-full w-full rounded-none text-slate-500 hover:bg-slate-100"
                          aria-label={`Kurangi ${menu.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="grid place-items-center border-x border-slate-200 text-sm font-bold text-slate-950">{quantity}</span>
                        <Button
                          type="button"
                          onClick={() => updateCart(menu.id, quantity + 1)}
                          variant="ghost"
                          size="none"
                          className="h-full w-full rounded-none text-primary-700 hover:bg-primary-50"
                          aria-label={`Tambah ${menu.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!menu.isAvailable}
                        onClick={() => updateCart(menu.id, 1)}
                      >
                        Tambah
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {!isLoading && filteredMenus.length === 0 ? (
          <Card className="p-6 text-center md:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-bold text-slate-950">Menu belum tersedia</h2>
            <p className="mt-2 text-sm text-slate-500">Silakan hubungi kasir untuk bantuan pemesanan.</p>
          </Card>
        ) : null}
      </section>

      {cartTotalItems > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-14px_28px_-24px_rgba(15,23,42,0.75)] backdrop-blur">
          <div className="mx-auto max-w-7xl">
            <Button
              as={Link}
              to={routePaths.customer.cart(table.tableNumber)}
              className="h-14 w-full justify-between rounded-xl px-5 md:ml-auto md:w-96"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {cartTotalItems} item
              </span>
              <span>{formatCurrency(cartTotalAmount)}</span>
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
