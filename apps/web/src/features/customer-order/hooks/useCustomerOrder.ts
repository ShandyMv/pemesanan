import { useCafe } from '../../../app/providers/CafeProvider';

export function useCustomerOrder() {
  const {
    cart,
    cartItems,
    categories,
    createOrder,
    error,
    isLoading,
    isSaving,
    loadOrder,
    loadPublicOrder,
    loadTable,
    menus,
    orders,
    payAtTable,
    tables,
    updateCart,
  } = useCafe();

  return {
    cart,
    cartItems,
    categories,
    createOrder,
    error,
    isLoading,
    isSaving,
    loadOrder,
    loadPublicOrder,
    loadTable,
    menus,
    orders,
    payAtTable,
    tables,
    updateCart,
  };
}
