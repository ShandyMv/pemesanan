import React from 'react';
import { Printer } from 'lucide-react';
import { appConfig } from '../../../app/config/app';
import { Button } from '../../../components/ui/Button';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import type { Order } from '../../../types/domain';

interface ThermalReceiptProps {
  order: Order;
}

export function ThermalReceipt({ order }: ThermalReceiptProps) {
  const payment = order?.payment;

  if (!order || !payment) return null;

  return (
    <div className="space-y-4">
      <div className="thermal-receipt mx-auto w-[320px] bg-white p-4 font-mono text-[12px] leading-relaxed text-slate-950 shadow-sm">
        <div className="text-center">
          <p className="text-base font-bold">{appConfig.receiptStoreName}</p>
          <p>Struk Pembayaran</p>
          <p>{formatDateTime(payment.paidAt)}</p>
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        <div className="space-y-1">
          <div className="flex justify-between gap-3">
            <span>Order</span>
            <span>{order.orderCode}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Meja</span>
            <span>{order.tableNumber}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Customer</span>
            <span>{order.customerName}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Kasir</span>
            <span>{payment.cashierName}</span>
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id}>
              <p className="font-semibold">{item.menuName}</p>
              <div className="flex justify-between gap-3">
                <span>{item.quantity} x {formatCurrency(item.price)}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        <div className="space-y-1">
          <div className="flex justify-between gap-3 font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Metode</span>
            <span>{payment.paymentMethodLabel}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Diterima</span>
            <span>{formatCurrency(payment.amountPaid)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Kembali</span>
            <span>{formatCurrency(payment.changeAmount)}</span>
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        <p className="text-center">Terima kasih</p>
      </div>

      <div className="no-print">
        <Button className="h-11 w-full" onClick={() => window.print()}>
          <Printer className="mr-2 h-5 w-5" />
          Print Struk
        </Button>
      </div>
    </div>
  );
}
