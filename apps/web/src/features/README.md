# Feature Modules

Setiap folder di `features` mewakili satu domain aplikasi. Struktur minimal feature:

```txt
feature-name/
  hooks/
  pages/
  routes.ts
```

Gunakan `routes.ts` untuk mendeklarasikan route milik feature tersebut. `src/app/router.tsx` hanya bertugas menggabungkan route antar-feature, memasang layout, dan memasang guard.

Gunakan `hooks/` sebagai adapter data milik feature. Hook membaca data dari provider aplikasi yang sudah terhubung ke REST API, sehingga page tidak perlu tahu detail endpoint, token, atau bentuk response backend.

Kode yang dipakai lintas feature tetap berada di:

- `src/components` untuk komponen UI, layout, feedback, dan routing shared.
- `src/app` untuk composition root, route registry, provider, dan konfigurasi aplikasi.
- `src/lib` untuk utility umum.
- `src/data` untuk data awal frontend-only.
