import { useCafe } from '../../../app/providers/CafeProvider';

export function useCashierOrders() {
  const { acceptOrder, confirmPayment, error, isLoading, isSaving, orders, refreshCashierOrders, rejectOrder } = useCafe();

  return {
    acceptOrder,
    confirmPayment,
    error,
    isLoading,
    isSaving,
    orders,
    refreshCashierOrders,
    rejectOrder,
  };
}
