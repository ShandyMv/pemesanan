import { useCafe } from '../../../app/providers/CafeProvider';

export function useAuth() {
  const { error, isSaving, login, logout, session } = useCafe();

  return {
    error,
    isSaving,
    login,
    logout,
    session,
  };
}
