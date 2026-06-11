import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCafe } from '../../app/providers/CafeProvider';
import { routePaths } from '../../app/routes/paths';
import type { Role } from '../../types/domain';

interface RequireRoleProps {
  role: Role;
  children: React.ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { session } = useCafe();

  if (!session || session.role !== role) {
    return <Navigate to={routePaths.login} replace />;
  }

  return children;
}
