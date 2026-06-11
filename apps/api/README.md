# Cafe TUDO API

NestJS REST API untuk aplikasi pemesanan QR Cafe TUDO.

## Stack

- NestJS
- Prisma ORM
- MySQL
- Jest unit test dengan coverage gate 100%

## Setup

```bash
cp apps/api/.env.example apps/api/.env
npm run setup:api
npm run dev:api
```

Seed lokal membuat akun awal:

- Admin: `admin@tudo.test` / `password`
- Kasir: `kasir@tudo.test` / `password`

## Scripts

```bash
npm run typecheck --workspace @cafe-tudo/api
npm run build --workspace @cafe-tudo/api
npm run test --workspace @cafe-tudo/api
```

## API Scope

- `POST /api/auth/login`
- `GET /api/public/tables/:code`
- `GET /api/public/menus`
- `POST /api/orders`
- `GET /api/orders/:orderCode`
- `GET /api/cashier/orders`
- `PATCH /api/cashier/orders/:id/pay`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `GET /api/admin/menus`
- `POST /api/admin/menus`
- `PATCH /api/admin/menus/:id`
- `DELETE /api/admin/menus/:id`
- `GET /api/admin/tables`
- `POST /api/admin/tables`
- `PATCH /api/admin/tables/:id`
- `GET /api/admin/tables/:id/qrcode`
- `GET /api/admin/reports/transactions`
