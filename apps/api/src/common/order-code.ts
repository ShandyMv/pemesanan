import { randomBytes } from 'node:crypto';

export function makeOrderCode(date: Date, sequence: number) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const number = String(sequence).padStart(3, '0');

  return `ORD-${year}${month}${day}-${number}`;
}

// Token acak tak-tertebak untuk akses pesanan dari HP customer tanpa login.
// Dipakai pada URL status & pembayaran mandiri di meja (bukan orderCode yang mudah ditebak).
export function makePublicToken() {
  return randomBytes(24).toString('base64url');
}
