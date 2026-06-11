import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { appConfig } from '../app/config/app';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat(appConfig.locale, {
    style: 'currency',
    currency: appConfig.currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateTime(value: string | number | Date | null | undefined) {
  if (!value) return '-';

  return new Intl.DateTimeFormat(appConfig.locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function toDateInputValue(value: string | number | Date = new Date()) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isWithinDateRange(value: string | number | Date, startDate?: string, endDate?: string) {
  const date = new Date(value);
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

  if (start && date < start) return false;
  if (end && date > end) return false;

  return true;
}

export function makeOrderCode(date: Date = new Date(), sequence = 1) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const number = String(sequence).padStart(3, '0');

  return `${appConfig.orderCodePrefix}-${year}${month}${day}-${number}`;
}
