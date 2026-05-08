# Finance Tracker - Frontend

Aplikasi pencatatan keuangan pribadi dengan estetika **Neobrutalism**.

## Stack Teknologi
- **Core**: React 18 + Vite
- **Styling**: Tailwind CSS v4 (Neobrutalism Design System)
- **State & Data**: TanStack Query v5 + Axios
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

## Fitur Utama
- **Sistem Notifikasi (Fase 7: Aggressive Notifications)**:
  - **Smart Threshold Logic**: Notifikasi hanya dipicu untuk ambang batas tertinggi (50%, 75%, 90%, 100%) untuk mencegah spam.
  - **Auto-Reset State**: Status notifikasi otomatis direset jika pengeluaran turun (transaksi dihapus/diedit), memastikan alert tetap akurat.
  - **Visual Alert Neobrutalist**: Toast notifikasi dengan kode warna agresif (Merah/Kuning/Cyan) dan desain bold.
  - **Dashboard Cleanup**: Perbaikan akurasi badge status global dan visualisasi chart yang lebih seimbang.

- **Fase 1-6 (Core Features)**:
  - **Autentikasi**: Login & Register dengan validasi Zod & Laravel Sanctum.
  - **Dashboard**: Ringkasan saldo riil, progress anggaran dinamis, dan chart interaktif.
  - **Transaksi**: Input cepat (FastAddModal), CRUD transaksi, dan kategori sistem vs user.
  - **Akun & Rekonsiliasi**: Manajemen akun bank/cash dan fitur penyesuaian saldo.

## Aturan Desain Global
1. **Border**: Minimal 2px/4px solid hitam.
2. **Shadows**: `shadow-[4px_4px_0px_0px_#000]` (Tanpa blur).
3. **Interaksi**: Efek "ditekan" pada hover/active menggunakan transisi `translate`.
4. **Emoji**: Dilarang menggunakan emoji dalam kode sumber atau UI (Murni teks/ikon).

## Cara Menjalankan
1. Pastikan Backend (Laravel) sudah berjalan di `http://localhost:8000`.
2. Instal dependensi: `npm install`.
3. Jalankan development server: `npm run dev`.
4. Akses melalui `http://localhost:5173` atau port yang tersedia.

## Struktur Proyek
- `src/api`: Konfigurasi Axios dan layanan API.
- `src/components/layout`: Komponen wrapper (AppLayout, BottomNav).
- `src/components/ui`: Komponen atom Neobrutalism (Button, Input).
- `src/pages`: Halaman aplikasi (Auth, Dashboard, dll).
- `src/store`: Manajemen state (Auth Store).
