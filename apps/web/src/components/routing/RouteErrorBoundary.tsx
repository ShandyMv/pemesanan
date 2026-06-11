import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { routePaths } from '../../app/routes/paths';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'Halaman tidak dapat dimuat.';

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Terjadi kendala</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <Button as={Link} to={routePaths.login} fullWidth className="mt-5">
          Kembali ke Login
        </Button>
      </Card>
    </main>
  );
}
