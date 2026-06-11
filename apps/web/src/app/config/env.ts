function readEnv(key: keyof ImportMetaEnv) {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/g, '');
}

export const env = {
  apiBaseUrl: normalizeBaseUrl(readEnv('VITE_API_BASE_URL')),
} as const;
