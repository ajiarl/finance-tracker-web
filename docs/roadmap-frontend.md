# Frontend Roadmap — Finance Tracker
> React + Vite + Tailwind + TanStack Query
> Disusun berdasarkan analisis PRD dan kode backend Laravel

---

## Ringkasan Arsitektur Frontend

Sebelum masuk ke fase, ada beberapa keputusan arsitektur yang harus ditetapkan di awal:

| Concern | Keputusan |
|---|---|
| State management | TanStack Query (server state) + Zustand (UI state) |
| Routing | React Router v6 |
| HTTP client | Axios dengan interceptor untuk Sanctum token |
| Formatting | `Intl.NumberFormat` untuk IDR, `date-fns` untuk tanggal |
| Form | React Hook Form + Zod |
| Charts | Chart.js via `react-chartjs-2` (ringan, cukup untuk VPS) |
| Notifikasi toast | Sonner atau React Hot Toast |
| i18n | `i18next` (default `id`, support `en`) |

---

## FASE 0 — Fondasi & Infrastruktur
> Estimasi: 2–3 hari | Harus selesai sebelum fase lain dimulai

Ini bukan fitur user-facing, tapi tanpa ini semua fase berikutnya tidak bisa berjalan.

### 0.1 Project Setup & Tooling
**Apa:** Inisialisasi Vite + React, konfigurasi Tailwind v4, ESLint, Prettier, alias path (`@/`), folder structure.

**Mengapa prioritas:** Seluruh tim harus mulai dari base yang sama. Salah konfigurasi di sini = technical debt yang mahal.

**Kompleksitas:** Rendah

**Struktur folder yang direkomendasikan:**
```
src/
├── api/          ← axios instances & endpoint functions
├── components/   ← shared/reusable components
├── features/     ← feature-based folders (auth, transactions, budgets, dll.)
├── hooks/        ← custom hooks
├── layouts/      ← AppLayout, AuthLayout
├── lib/          ← utils, formatters, constants
├── pages/        ← route-level components
├── stores/       ← zustand stores
└── types/        ← TypeScript interfaces (opsional tapi disarankan)
```

---

### 0.2 HTTP Client & Auth Interceptor
**Apa:** Setup Axios instance dengan `baseURL`, request interceptor untuk menyisipkan `Authorization: Bearer <token>`, dan response interceptor untuk handle `401` (redirect ke login + clear token).

**Mengapa prioritas:** Semua API call bergantung pada ini. Backend pakai Sanctum token — tanpa interceptor, setiap komponen harus handle token secara manual.

**Kompleksitas:** Rendah

**API yang terlibat:**
- `POST /api/login` → simpan token ke localStorage
- `POST /api/logout` → hapus token
- `GET /api/user` → validasi sesi aktif

---

### 0.3 Global State: Auth Store
**Apa:** Zustand store untuk menyimpan `user`, `token`, dan status autentikasi. Dipakai oleh route guards dan navbar.

**Mengapa prioritas:** Hampir semua halaman butuh tahu apakah user sudah login. Harus ada sebelum routing dibuat.

**Kompleksitas:** Rendah

---

### 0.4 Routing & Layout Shell
**Apa:** Setup React Router dengan dua layout: `AuthLayout` (untuk login/register) dan `AppLayout` (navbar + sidebar/bottom-nav untuk halaman protected). Termasuk `ProtectedRoute` wrapper.

**Mengapa prioritas:** Semua halaman butuh layout. Tanpa ini, tidak ada yang bisa dikerjakan paralel.

**Kompleksitas:** Rendah-Sedang

**Rute yang perlu dibuat:**
```
/login          → AuthLayout
/register       → AuthLayout
/               → AppLayout → Dashboard
/transactions   → AppLayout → TransactionList
/budgets        → AppLayout → BudgetList
/accounts       → AppLayout → AccountList
/import         → AppLayout → ImportFlow
/reports        → AppLayout → Reports
/insights       → AppLayout → AiInsights
/settings       → AppLayout → Settings
/notifications  → AppLayout → Notifications
```

---

### 0.5 Komponen UI Primitif (Design System Mini)
**Apa:** Buat komponen dasar yang akan dipakai di seluruh aplikasi: `Button`, `Input`, `Select`, `Modal`, `Card`, `Badge`, `Spinner`, `Toast`, `ProgressBar`, `EmptyState`, `Skeleton`.

**Mengapa prioritas:** Tanpa ini, setiap developer akan membuat komponen sendiri → inkonsistensi visual.

**Kompleksitas:** Sedang

---

### 0.6 Utility & Formatter
**Apa:** Helper functions: `formatIDR(amount)`, `formatDate(date)`, `formatPercent(n)`, konstanta tipe akun/transaksi, dan setup `i18next` dengan string Bahasa Indonesia.

**Kompleksitas:** Rendah

---

## FASE 1 — Core: Autentikasi & Onboarding
> Estimasi: 2–3 hari | Gerbang masuk aplikasi

### 1.1 Halaman Register
**Apa:** Form nama, email, password, konfirmasi password. Validasi client-side dengan Zod. Setelah sukses, auto-login dan redirect ke dashboard.

**Mengapa prioritas:** User tidak bisa masuk ke aplikasi tanpa ini.

**API:** `POST /api/register` → `{ data: user, token }`

**Kompleksitas:** Rendah

**Catatan penting:** Backend mengembalikan `token` langsung saat register — simpan dan set auth state seketika, tidak perlu redirect ke login.

---

### 1.2 Halaman Login
**Apa:** Form email + password. Simpan token ke localStorage, update auth store, redirect ke dashboard.

**API:** `POST /api/login` → `{ data: user, token }`

**Kompleksitas:** Rendah

---

### 1.3 Logout
**Apa:** Tombol logout di navbar/menu. Panggil API, hapus token, redirect ke `/login`.

**API:** `POST /api/logout`

**Kompleksitas:** Rendah

---

## FASE 2 — Core: Dashboard
> Estimasi: 3–4 hari | Halaman utama yang paling sering dilihat

### 2.1 Dashboard — Summary Cards
**Apa:** Kartu ringkasan: Total Saldo, Pemasukan Bulan Ini, Pengeluaran Bulan Ini. Ada month picker untuk ganti bulan.

**Mengapa prioritas:** Ini halaman pertama yang dilihat user setelah login. Harus informatif dan cepat.

**API:** `GET /api/dashboard?month=YYYY-MM`

**Response kunci:**
```json
{
  "data": {
    "total_balance": 5000000,
    "income_this_month": 3500000,
    "expense_this_month": 2100000,
    "budgets": [...]
  }
}
```

**Kompleksitas:** Rendah-Sedang

---

### 2.2 Dashboard — Budget Progress List
**Apa:** List budget aktif dengan progress bar berwarna (hijau < 50%, kuning 50–75%, merah > 90%). Data budget sudah diembedd di response dashboard.

**Mengapa prioritas:** Budget progress adalah motivator utama user untuk cek dashboard harian.

**Kompleksitas:** Rendah

**Catatan:** Data budget (termasuk `spent`, `amount`, `percentage_used`) sudah direturn di `/api/dashboard` — tidak perlu API call terpisah.

---

### 2.3 Dashboard — Charts
**Apa:** Tiga chart:
1. **Category Breakdown** — pie/donut chart pengeluaran per kategori
2. **Weekly Trend** — bar chart income vs expense per minggu
3. **Daily Cashflow** — line chart cashflow harian

**API:** `GET /api/dashboard/charts?month=YYYY-MM`

**Response kunci:** `category_breakdown[]`, `weekly_trend[]`, `daily_cashflow[]`

**Kompleksitas:** Sedang

**Catatan teknis:** Lazy load charts dengan `IntersectionObserver`. Data sudah diproses server-side — client hanya render.

---

### 2.4 FAB (Floating Action Button) — Fast Add
**Apa:** Tombol `+` fixed di kanan bawah layar yang membuka modal Fast Add Transaction. Ini adalah entry point utama untuk input transaksi harian.

**Mengapa prioritas:** PRD menetapkan target <10 detik per transaksi. FAB adalah kunci untuk mencapai itu.

**Kompleksitas:** Rendah (FAB-nya saja; modal ada di Fase 3)

---

## FASE 3 — Core: Transaksi (CRUD)
> Estimasi: 4–5 hari | Fitur paling sering digunakan

### 3.1 Modal Fast Add Transaction
**Apa:** Modal compact untuk input cepat dengan: amount input (numeric), tombol preset (5k, 10k, 20k, 50k), account selector (default: last used), tipe toggle (pengeluaran/pemasukan/transfer), category selector dengan autocomplete, date picker (default: hari ini), field note & tags. Tombol "Simpan" + "Simpan & Ulangi".

**Mengapa prioritas:** Ini adalah fitur yang paling sering dipakai (daily). Kualitas UX di sini berdampak langsung ke DAU.

**API:**
- `GET /api/accounts` — untuk account selector
- `GET /api/categories?type=expense` — untuk category selector
- `POST /api/transactions` — submit transaksi

**Optimistic update:** Append ke cache transaksi seketika, rollback kalau API gagal.

**Kompleksitas:** Tinggi

**Ketergantungan:** Fase 2 (FAB), Fase 4 (accounts), Fase 5 (categories)

---

### 3.2 Halaman Daftar Transaksi
**Apa:** List transaksi dikelompokkan per hari, dengan filter bar (tipe, akun, kategori, rentang tanggal). Tiap baris menampilkan: ikon kategori, deskripsi, jumlah, dan badge tipe.

**API:** `GET /api/transactions?type=&account_id=&category_id=&date_from=&date_to=`

**Kompleksitas:** Sedang

---

### 3.3 Edit & Hapus Transaksi
**Apa:** Drawer/modal edit yang muncul saat tap baris transaksi. Tombol hapus dengan konfirmasi dialog. Saat hapus, balance akun otomatis direcalculate oleh backend.

**API:**
- `PUT /api/transactions/{id}` — update
- `DELETE /api/transactions/{id}` — soft delete

**Kompleksitas:** Sedang

**Catatan penting dari backend:** Saat transaksi diupdate, backend menjalankan dua operasi balance: reverse balance lama, apply balance baru. Frontend tidak perlu melakukan kalkulasi — cukup invalidate query account.

---

## FASE 4 — Core: Manajemen Akun [DONE]
> Estimasi: 2–3 hari

### 4.1 Halaman Daftar Akun [DONE]
**Apa:** List akun user dengan saldo masing-masing, badge tipe (Cash, Bank, E-Wallet, dll.), dan tombol tambah akun.

**API:** `GET /api/accounts`

**Kompleksitas:** Rendah

---

### 4.2 Tambah & Edit Akun [DONE]
**Apa:** Form create/edit akun: nama, tipe (cash/bank/e-wallet/credit/investment), saldo awal.

**API:**
- `POST /api/accounts`
- `PUT /api/accounts/{id}`

**Kompleksitas:** Rendah

---

### 4.3 Rekonsiliasi Akun [DONE]
**Apa:** Form rekonsiliasi: input saldo aktual, preview selisih, konfirmasi. Backend otomatis membuat transaksi penyesuaian.

**API:** `POST /api/accounts/{account}/reconcile`

**Response kunci:**
```json
{
  "data": {
    "account": { "old_balance": 100000, "new_balance": 125000, "difference": 25000 },
    "adjustment_transaction": { "type": "income", "amount": 25000 }
  }
}
```

**Kompleksitas:** Rendah-Sedang

**Catatan:** Jika `difference === 0`, backend return 200 tanpa transaksi baru. Jika ada selisih, return 201 dengan transaksi adjustment.

---

## FASE 5 — Core: Kategori [DONE]
> Estimasi: 2 hari

### 5.1 Halaman Manajemen Kategori [DONE]
**Apa:** List kategori user + kategori sistem (dengan label "Sistem" dan tidak bisa diedit/hapus). Tab filter: Semua / Pengeluaran / Pemasukan. Tombol tambah kategori user.

**API:** `GET /api/categories?type=income|expense`

**Kompleksitas:** Rendah-Sedang

**Catatan penting dari backend:** Kategori dengan `user_id = null` adalah kategori sistem — tampilkan badge khusus dan disable tombol edit/hapus. Backend akan return 403 jika dicoba diubah.

---

### 5.2 Form Kategori [DONE]
**Apa:** Modal create/edit: nama, tipe, ikon (text input untuk nama icon), color picker (harus format `#RRGGBB`).

**API:**
- `POST /api/categories`
- `PATCH /api/categories/{id}`
- `DELETE /api/categories/{id}` → 204 No Content

**Kompleksitas:** Rendah

---

## FASE 6 — Core: Budgets & Alerts [DONE]
> Estimasi: 3–4 hari

### 6.1 Halaman Daftar Budget
**Apa:** List budget aktif dengan progress bar berwarna, nominal spent vs total, persentase, periode (monthly/weekly/yearly), dan tanggal berakhir.

**API:** `GET /api/budgets`

**Kompleksitas:** Rendah-Sedang

---

### 6.2 Form Budget
**Apa:** Modal create/edit budget: nama, kategori (bisa kosong = budget global), nominal, periode, tanggal mulai-selesai, toggle aktif/nonaktif.

**API:**
- `POST /api/budgets`
- `PUT /api/budgets/{id}`

**Validasi penting:** `end_date` harus setelah `start_date`. Backend akan return 422 kalau tidak.

**Kompleksitas:** Sedang

---

### 6.3 Budget Alert — Notifikasi In-App
**Apa:** Ini **tidak perlu konfigurasi UI khusus** karena backend sudah otomatis trigger alert saat threshold 50/75/90/100% terlampaui (via `TransactionObserver` → `BudgetAlertService`). Frontend hanya perlu menampilkan notifikasi yang sudah ada di database.

**Ketergantungan:** Fase 7 (Notifikasi)

**Kompleksitas:** Rendah (karena logic ada di backend)

---

## FASE 7 — Supporting: Notifikasi [DONE]
> Estimasi: 2 hari

### 7.1 Notification Center
**Apa:** Halaman/drawer daftar notifikasi diurutkan terbaru. Tampilkan `title`, `message`, `type` (info/warning/error sebagai warna badge), `is_read`, dan `created_at`.

**API:** `GET /api/notifications`

**Response kunci:**
```json
{
  "data": [...],
  "meta": { "total": 5, "unread_count": 2 }
}
```

**Kompleksitas:** Rendah

---

### 7.2 Mark as Read
**Apa:** Tap notifikasi → mark as read. Tombol "Tandai Semua Dibaca" di header.

**API:**
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/read-all`

**Catatan:** Route `read-all` harus dideklarasikan sebelum `{id}/read` di React Router juga — gunakan urutan rute yang benar.

**Kompleksitas:** Rendah

---

### 7.3 Notif Badge di Navbar
**Apa:** Badge merah dengan angka `unread_count` di ikon notifikasi navbar. Poll setiap 60 detik atau refetch setelah aksi tertentu.

**Kompleksitas:** Rendah

---

## FASE 8 — Supporting: Import CSV [DONE]
> Estimasi: 4–5 hari | Kompleks karena multi-step flow

### 8.1 Step 1 — Upload File
**Apa:** Drag-and-drop atau file picker. Upload ke backend, dapatkan `import_id`. Tampilkan preview 10 baris pertama dan daftar header kolom.

**API:** `POST /api/imports/csv` (multipart/form-data)

**Response kunci:**
```json
{
  "data": {
    "import_id": 123,
    "headers": ["date", "amount", "type", "description"],
    "preview": [...],
    "rows_total": 200
  }
}
```

**Kompleksitas:** Sedang

---

### 8.2 Step 2 — Column Mapping UI
**Apa:** UI pemetaan kolom CSV ke field transaksi. Dropdown per field (date, amount, type, description, category, notes). Toggle "has_header". Input format tanggal (misal `d/m/Y`). Pilih akun tujuan.

**API:** `GET /api/imports/{import}/status` — untuk cek ulang header jika perlu

**Kompleksitas:** Tinggi

---

### 8.3 Step 3 — Proses & Polling Status
**Apa:** Submit mapping, mulai proses. Polling `status` setiap 2 detik. Tampilkan progress bar `rows_processed / rows_total`. Saat selesai, tampilkan ringkasan: berhasil, gagal, daftar error per baris.

**API:**
- `POST /api/imports/{import}/map` → mulai proses
- `GET /api/imports/{import}/status` → polling

**Kompleksitas:** Sedang-Tinggi

---

## FASE 9 — Supporting: Laporan (Reports)
> Estimasi: 2 hari

### 9.1 Halaman Reports
**Apa:** Form pilih bulan + format (PDF/XLSX). Tombol "Buat Laporan". List riwayat laporan dengan status (queued/processing/ready/failed) dan tombol download saat ready.

**API:**
- `POST /api/reports` → `{ data: { report_id, status: "queued" } }` — return 202
- `GET /api/reports/{report}/status` — polling setiap 3 detik sampai `status === "ready"`
- `GET /api/reports/{report}/download` — trigger download file

**Kompleksitas:** Sedang

**Catatan:** Backend dispatch `GenerateReport` job secara sync di local env, async di production. Pastikan UI handle kedua kasus (langsung ready vs perlu poll).

---

## FASE 10 — Supporting: AI Insights
> Estimasi: 3–4 hari

### 10.1 Halaman Insights — Summary Cards
**Apa:** Tampilkan hasil analisis AI: prediksi pengeluaran bulan depan, tren (naik/turun %), outlook tabungan (excellent/good/caution/deficit), top 5 kategori prediksi.

**API:** `GET /api/insights`

**Response kunci:**
```json
{
  "data": {
    "predictions": {
      "next_month": "2026-06",
      "predicted_expense": 2100000,
      "predicted_income": 5000000,
      "predicted_savings": 2900000,
      "savings_outlook": "excellent",
      "top_categories": [...]
    },
    "anomalies": [...],
    "recommendations": [...]
  },
  "meta": { "anomaly_count": 2, "recommendation_count": 3 }
}
```

**Kompleksitas:** Rendah-Sedang (data sudah diolah backend)

---

### 10.2 Anomaly Cards
**Apa:** List anomali pengeluaran. Tiap card menampilkan kategori, jumlah bulan ini vs rata-rata, persentase kenaikan, z-score, dan severity badge (info/warning/critical).

**Kompleksitas:** Rendah

---

### 10.3 Recommendation Cards
**Apa:** List rekomendasi berurutan dari prioritas tinggi ke rendah. Tiap card menampilkan tipe rekomendasi dan pesan dalam Bahasa Indonesia.

**Kompleksitas:** Rendah

---

### 10.4 Conversational UI (Nice-to-have dalam fase ini)
**Apa:** Panel chat sederhana di bawah cards. User bisa ketik pertanyaan, frontend kirim ulang ke `GET /api/insights` dengan konteks berbeda atau tampilkan ulang data yang sudah ada. Tidak butuh backend baru — ini client-side logic.

**Kompleksitas:** Tinggi (UX-nya kompleks, logic sederhana)

---

## FASE 11 — Supporting: Settings
> Estimasi: 1–2 hari

### 11.1 Halaman Settings
**Apa:** Form preferensi: locale (id/en), mata uang (IDR/USD/EUR/SGD/MYR). Tampilkan nilai saat ini, update via PATCH.

**API:**
- `GET /api/settings`
- `PATCH /api/settings`

**Validasi:** Payload kosong akan ditolak backend dengan 422 — handle ini di client sebelum kirim request.

**Kompleksitas:** Rendah

---

### 11.2 Data Export
**Apa:** Tombol "Ekspor Data Saya" yang trigger download JSON berisi seluruh data finansial user.

**API:** `GET /api/user/export-data` → download file JSON

**Kompleksitas:** Rendah

---

### 11.3 Hapus Akun
**Apa:** Tombol berbahaya dengan double-confirm dialog (ketik "HAPUS" atau masukkan password). Backend butuh password untuk verifikasi.

**API:** `DELETE /api/user/delete-account` dengan body `{ "password": "..." }`

**Catatan backend:** Backend menghapus data secara berurutan: transactions → accounts → categories → budgets → notifications → tokens → users.

**Kompleksitas:** Rendah-Sedang

---

## FASE 12 — Polish & Production
> Estimasi: 3–5 hari | Dilakukan setelah semua fitur core selesai

### 12.1 Error Handling Global
**Apa:** Error boundary React, global 401/403/422/500 handler di Axios interceptor, toast notification untuk error API, empty states yang informatif.

**Kompleksitas:** Sedang

---

### 12.2 Loading States & Skeletons
**Apa:** Skeleton loader untuk semua list dan dashboard cards. Spinner untuk form submit. `keepPreviousData: true` di TanStack Query saat ganti filter/bulan.

**Kompleksitas:** Rendah-Sedang

---

### 12.3 Mobile Responsiveness & PWA
**Apa:** Audit tampilan mobile (320px–430px). Bottom navigation bar untuk mobile. Pertimbangkan PWA manifest untuk "Add to Home Screen".

**Kompleksitas:** Sedang

---

### 12.4 Performa & Bundle Size
**Apa:** Code splitting per route (`React.lazy`), lazy load chart library, optimasi gambar, audit bundle dengan `vite-bundle-analyzer`.

**Kompleksitas:** Sedang

---

## Ringkasan Visual Roadmap

```
FASE 0: Fondasi         ████████░░░░░░░░░░░░░░░░  (2-3 hari)
FASE 1: Auth            ██████░░░░░░░░░░░░░░░░░░  (2-3 hari)
FASE 2: Dashboard       ████████░░░░░░░░░░░░░░░░  (3-4 hari)
FASE 3: Transaksi       ██████████░░░░░░░░░░░░░░  (4-5 hari)
FASE 4: Akun            ██████░░░░░░░░░░░░░░░░░░  (2-3 hari)
FASE 5: Kategori        ████░░░░░░░░░░░░░░░░░░░░  (2 hari)
FASE 6: Budget          ████████████████████████  (DONE)
FASE 7: Notifikasi      ████████████████████████  (DONE)
FASE 8: Import CSV      ████████████████████████  (DONE)
FASE 9: Reports         ████░░░░░░░░░░░░░░░░░░░░  (NEXT GOAL)
FASE 10: AI Insights    ████████░░░░░░░░░░░░░░░░  (3-4 hari)
FASE 11: Settings       ████░░░░░░░░░░░░░░░░░░░░  (1-2 hari)
FASE 12: Polish         ██████████░░░░░░░░░░░░░░  (3-5 hari)

Total estimasi: ~35-48 hari kerja
```

---

## Ketergantungan Antar Fase (Dependency Graph)

```
FASE 0 (Fondasi)
    └── FASE 1 (Auth)
            ├── FASE 2 (Dashboard)
            │       └── FASE 4 (Akun) ──┐
            │       └── FASE 5 (Kat.) ──┤
            │                           │
            └── FASE 3 (Transaksi) ◄────┘
                    ├── FASE 6 (Budget)
                    │       └── FASE 7 (Notifikasi)
                    ├── FASE 8 (Import CSV)
                    └── FASE 9 (Reports)

FASE 10 (AI Insights) → bisa paralel setelah FASE 3
FASE 11 (Settings)    → bisa paralel setelah FASE 1
FASE 12 (Polish)      → dilakukan terakhir
```

---

## Catatan Penting dari Analisis Backend

### 1. Balance Accounting Otomatis
Backend mengelola balance akun secara otomatis di `TransactionController::applyBalanceDelta()`. Artinya:
- Frontend **tidak boleh** menghitung atau mengupdate balance sendiri
- Setelah create/update/delete transaksi → **invalidate query `/api/accounts`** agar saldo terbaru terambil

### 2. Budget Alert Sudah Fully Automated
`TransactionObserver` → `BudgetAlertService` sudah handle semua logika alert. Frontend hanya perlu:
- Tampilkan notifikasi dari `GET /api/notifications`
- Badge unread count di navbar

### 3. System Categories
Kategori dengan `user_id = null` tidak bisa diedit/hapus. Backend return 403. Frontend harus:
- Tampilkan badge "Sistem"
- Disable tombol edit/hapus untuk kategori ini
- Validasi sebelum kirim request

### 4. Transaction Type ↔ Category Type Harus Match
Backend validasi: `category.type !== transaction.type` → 422. Handle ini di client sebelum submit:
```js
// Filter kategori berdasarkan tipe transaksi yang dipilih
const filteredCategories = categories.filter(c => c.type === selectedType);
```

### 5. Soft Delete pada Transaksi
Transaksi menggunakan soft delete (`deleted_at`). Ini transparan untuk frontend — cukup kirim `DELETE /api/transactions/{id}` dan invalidate query list.

### 6. Import CSV: Dua-Step Process
Upload dulu (`POST /api/imports/csv`), dapat `import_id`, baru mapping (`POST /api/imports/{id}/map`). Jangan gabung jadi satu step di UI.

### 7. Report Download
`GET /api/reports/{report}/download` mengembalikan file binary langsung (bukan URL). Gunakan:
```js
const response = await axios.get(url, { responseType: 'blob' });
const link = document.createElement('a');
link.href = URL.createObjectURL(response.data);
link.download = `laporan-${month}.${format}`;
link.click();
```
