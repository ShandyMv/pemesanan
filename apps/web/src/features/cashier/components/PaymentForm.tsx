import React, { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Banknote, CreditCard } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { formatCurrency } from '../../../lib/utils';
import type { Order, PaymentMethod, PaymentPayload } from '../../../types/domain';

const paymentMethods: Array<{ value: PaymentMethod; label: string; icon: LucideIcon }> = [
  { value: 'cash', label: 'Tunai', icon: Banknote },
  { value: 'cashless', label: 'Non Tunai', icon: CreditCard },
];

function getRoundedAmount(amount: number, base: number) {
  return Math.ceil(amount / base) * base;
}

interface PaymentFormProps {
  order: Order;
  onSubmit: (payload: PaymentPayload) => void;
}

export function PaymentForm({ order, onSubmit }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState(String(order.totalAmount));
  const [error, setError] = useState('');

  const numericAmountPaid = Number(amountPaid);
  const changeAmount = paymentMethod === 'cash' && numericAmountPaid > order.totalAmount
    ? numericAmountPaid - order.totalAmount
    : 0;

  const quickAmounts = useMemo(() => {
    const values = [
      order.totalAmount,
      getRoundedAmount(order.totalAmount, 50000),
      getRoundedAmount(order.totalAmount, 100000),
    ];

    return [...new Set(values)].filter((value) => value >= order.totalAmount);
  }, [order.totalAmount]);

  useEffect(() => {
    setError('');
    if (paymentMethod === 'cashless') {
      setAmountPaid(String(order.totalAmount));
    }
  }, [order.totalAmount, paymentMethod]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!Number.isFinite(numericAmountPaid) || numericAmountPaid <= 0) {
      setError('Nominal pembayaran wajib diisi dengan benar.');
      return;
    }

    if (numericAmountPaid < order.totalAmount) {
      setError('Nominal pembayaran tidak boleh kurang dari total tagihan.');
      return;
    }

    if (paymentMethod === 'cashless' && numericAmountPaid !== order.totalAmount) {
      setError('Nominal non tunai harus sama dengan total tagihan.');
      return;
    }

    onSubmit({
      paymentMethod,
      amountPaid: numericAmountPaid,
      changeAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Pembayaran</p>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Button
                key={method.value}
                type="button"
                variant={paymentMethod === method.value ? 'surface' : 'ghost'}
                className="h-10 rounded-lg shadow-none"
                onClick={() => setPaymentMethod(method.value)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {method.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nominal diterima</label>
        <Input
          type="number"
          min={order.totalAmount}
          step="1000"
          value={amountPaid}
          onChange={(event) => setAmountPaid(event.target.value)}
        />
        {paymentMethod === 'cashless' ? (
          <p className="mt-1.5 text-xs font-medium text-slate-500">Pembayaran non tunai dicatat sesuai total transaksi.</p>
        ) : null}
      </div>

      {paymentMethod === 'cash' ? (
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((value) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAmountPaid(String(value))}
            >
              {formatCurrency(value)}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="font-semibold text-slate-500">Total tagihan</span>
          <span className="font-bold text-slate-950">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="font-semibold text-slate-500">Diterima</span>
          <span className="font-bold text-slate-950">{formatCurrency(numericAmountPaid || 0)}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
          <span className="font-semibold text-slate-500">Kembalian</span>
          <span className="font-bold text-emerald-700">{formatCurrency(changeAmount)}</span>
        </div>
      </div>

      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}

      <Button type="submit" className="h-11 w-full">
        <CreditCard className="mr-2 h-5 w-5" />
        Konfirmasi & Buat Struk
      </Button>
    </form>
  );
}
