import { useCafe } from '../../../app/providers/CafeProvider';

export function useAdminData() {
  const {
    categories,
    deleteCategory,
    deleteMenu,
    error,
    isLoading,
    isSaving,
    menus,
    orders,
    refreshAdminData,
    tables,
    upsertCategory,
    upsertMenu,
    upsertTable,
  } = useCafe();

  return {
    categories,
    deleteCategory,
    deleteMenu,
    error,
    isLoading,
    isSaving,
    menus,
    orders,
    refreshAdminData,
    tables,
    upsertCategory,
    upsertMenu,
    upsertTable,
  };
}
