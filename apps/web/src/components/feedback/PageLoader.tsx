import React from 'react';

export function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary-600" />
        Memuat halaman
      </div>
    </div>
  );
}
