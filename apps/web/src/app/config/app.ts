import type { Role, UserSession } from '../../types/domain';

interface AppConfig {
  appName: string;
  appShortName: string;
  appDescription: string;
  defaultTableId: string;
  orderCodePrefix: string;
  orderCodeExample: string;
  qrCodePrefix: string;
  locale: string;
  currency: string;
  receiptStoreName: string;
  demoUsers: Record<Role, UserSession>;
  scanner: {
    allowedHttpHosts: string[];
    delayBetweenScanAttempts: number;
    delayBetweenScanSuccess: number;
    cameraWidth: number;
    cameraHeight: number;
  };
}

export const appConfig: AppConfig = {
  appName: 'Cafe TUDO',
  appShortName: 'TUDO',
  appDescription: 'Sistem pemesanan QR meja, pembayaran kasir, dan operasional menu Cafe TUDO.',
  defaultTableId: 'M-01',
  orderCodePrefix: 'ORD',
  orderCodeExample: 'ORD-1001',
  qrCodePrefix: 'QR',
  locale: 'id-ID',
  currency: 'IDR',
  receiptStoreName: 'CAFE TUDO',
  demoUsers: {
    admin: {
      id: 1,
      name: 'Admin Cafe TUDO',
      email: 'admin@tudo.test',
      role: 'admin',
      accessToken: '',
    },
    cashier: {
      id: 2,
      name: 'Kasir Cafe TUDO',
      email: 'kasir@tudo.test',
      role: 'cashier',
      accessToken: '',
    },
  },
  scanner: {
    allowedHttpHosts: ['localhost', '127.0.0.1'],
    delayBetweenScanAttempts: 250,
    delayBetweenScanSuccess: 500,
    cameraWidth: 1280,
    cameraHeight: 720,
  },
};

export function getPublicBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;

  return '';
}

export function toPublicUrl(path: string) {
  const baseUrl = getPublicBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

export function isScannerOriginSupported() {
  if (typeof window === 'undefined') return false;
  if (window.location.protocol === 'https:') return true;

  return appConfig.scanner.allowedHttpHosts.includes(window.location.hostname);
}
