import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Coffee, LayoutDashboard, LogIn, ScanLine, Smartphone } from 'lucide-react';
import { appConfig } from '../../../app/config/app';
import { routePaths } from '../../../app/routes/paths';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import type { Role, UserSession } from '../../../types/domain';

const internalUsers: Record<Role, UserSession> = appConfig.demoUsers;

export function LoginPage() {
  const navigate = useNavigate();
  const { isSaving, login, session } = useAuth();
  const [role, setRole] = useState<Role>('admin');
  const [email, setEmail] = useState(internalUsers.admin.email);
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');

  if (session?.role === 'admin') return <Navigate to={routePaths.admin.dashboard} replace />;
  if (session?.role === 'cashier') return <Navigate to={routePaths.cashier.orders} replace />;

  const handleRoleChange = (nextRole: Role) => {
    setRole(nextRole);
    setEmail(internalUsers[nextRole].email);
    setSubmitError('');
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setSubmitError('Email dan password wajib diisi.');
      return;
    }

    try {
      const user = await login({ email: email.trim(), password });
      navigate(user.role === 'admin' ? routePaths.admin.dashboard : routePaths.cashier.orders);
    } catch {
      setSubmitError('Email atau password tidak sesuai.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Coffee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">{appConfig.appName}</p>
                <h1 className="text-4xl font-bold tracking-tight text-slate-950">Sistem Pemesanan QR</h1>
              </div>
            </div>
            <p className="text-base leading-7 text-slate-600">
              {appConfig.appDescription}
            </p>

            <div className="mt-8 grid gap-3">
              <Button
                as={Link}
                to={routePaths.defaultTable}
                variant="surface"
                size="none"
                className="w-full items-center gap-4 p-4"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-primary-700">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-950">Pesan dari meja</p>
                  <p className="text-sm text-slate-500">Pilih menu dan buat order dari QR meja.</p>
                </div>
              </Button>
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <ScanLine className="mb-3 h-5 w-5 text-primary-700" />
                  <p className="font-bold text-slate-950">Kasir</p>
                  <p className="text-sm text-slate-500">Cari order dan terima pembayaran.</p>
                </div>
                <div>
                  <LayoutDashboard className="mb-3 h-5 w-5 text-primary-700" />
                  <p className="font-bold text-slate-950">Admin</p>
                  <p className="text-sm text-slate-500">Kelola menu, meja, dan laporan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-xl bg-primary-50 text-primary-700 lg:hidden">
              <Coffee className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Masuk Internal</CardTitle>
            <CardDescription>Pilih peran, lalu masuk dengan akun operasional.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <Button
                type="button"
                onClick={() => handleRoleChange('admin')}
                variant={role === 'admin' ? 'surface' : 'ghost'}
                className="h-10 rounded-lg shadow-none"
              >
                Admin
              </Button>
              <Button
                type="button"
                onClick={() => handleRoleChange('cashier')}
                variant={role === 'cashier' ? 'surface' : 'ghost'}
                className="h-10 rounded-lg shadow-none"
              >
                Kasir
              </Button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={appConfig.demoUsers.admin.email}
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password akun"
                  required
                />
              </div>

              {submitError ? <p className="text-sm font-medium text-rose-600">{submitError}</p> : null}

              <Button type="submit" className="h-11 w-full" disabled={isSaving}>
                <LogIn className="mr-2 h-5 w-5" /> {isSaving ? 'Memeriksa akun...' : 'Masuk'}
              </Button>
            </form>

            <Button as={Link} to={routePaths.defaultTable} variant="outline" fullWidth className="mt-4 h-11 lg:hidden">
              Buka Halaman Meja
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
