import type { ComponentType } from 'react';

type LazyModule = Record<string, ComponentType>;

export function lazyRoute(importer: () => Promise<LazyModule>, exportName: string) {
  return async () => {
    const module = await importer();
    if (!module[exportName]) {
      throw new Error(`Route export "${exportName}" tidak ditemukan.`);
    }

    return { Component: module[exportName] };
  };
}
