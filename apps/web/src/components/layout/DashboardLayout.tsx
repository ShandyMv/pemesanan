import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Coffee, LogOut, Menu } from 'lucide-react';
import { appConfig } from '../../app/config/app';
import { useCafe } from '../../app/providers/CafeProvider';
import { routePaths } from '../../app/routes/paths';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { NavigationItem } from '../../types/domain';

interface DashboardLayoutProps {
  navigation: NavigationItem[];
  title: string;
}

export function DashboardLayout({ navigation, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const { logout, session } = useCafe();

  const handleLogout = () => {
    logout();
    navigate(routePaths.login);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white shadow-soft transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex h-20 items-center border-b border-slate-200 px-6">
            <div className="mr-3 grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xl font-bold tracking-tight text-slate-950">{appConfig.appShortName}</span>
              <span className="text-xs font-medium text-slate-500">Operasional cafe</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }: { isActive: boolean }) => cn(
                    "flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                    isActive 
                      ? "bg-primary-50 text-primary-700 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 opacity-80" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <p className="truncate text-sm font-bold text-slate-950">{session?.name}</p>
              <p className="truncate text-xs text-slate-500">{session?.email}</p>
            </div>
            <Button
              type="button"
              onClick={handleLogout}
              variant="dangerGhost"
              fullWidth
              className="h-11 justify-start px-4"
            >
              <LogOut className="mr-3 h-5 w-5 opacity-80" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md lg:px-10">
          <Button
            type="button"
            onClick={() => setSidebarOpen(true)}
            variant="ghost"
            size="icon"
            className="-ml-2 mr-4 lg:hidden"
            aria-label="Buka navigasi"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{session?.role === 'admin' ? 'Admin' : 'Kasir'}</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
