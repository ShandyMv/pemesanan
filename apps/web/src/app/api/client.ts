import { env } from '../config/env';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';

type QueryValue = string | number | boolean | null | undefined;

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  query?: Record<string, QueryValue>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getBaseUrl() {
  return env.apiBaseUrl || DEFAULT_API_BASE_URL;
}

function makeUrl(path: string, query?: Record<string, QueryValue>) {
  const baseUrl = getBaseUrl().replace(/\/+$/g, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`, window.location.origin);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string') return message;
  }

  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
  });

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(makeUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Permintaan tidak dapat diproses.'), response.status, data);
  }

  return data as T;
}

export function getApiErrorMessage(error: unknown, fallback = 'Terjadi kendala. Silakan coba lagi.') {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return 'Tidak bisa terhubung ke server. Pastikan backend sedang berjalan.';
  if (error instanceof Error) return error.message;
  return fallback;
}
