# Finance Tracker - Frontend

Aplikasi pencatatan keuangan pribadi dengan estetika **Neobrutalism**.

## Stack Teknologi
- **Core**: React 18 + Vite
- **Styling**: Tailwind CSS v4 (Neobrutalism Design System)
- **State & Data**: TanStack Query v5 + Axios
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

## Fitur Utama (Fase 1: Autentikasi & Layout)
- **Desain Neobrutalism**: Border hitam tebal, bayangan solid, dan warna kontras tinggi.
- **Autentikasi**:
  - Halaman Login & Register dengan validasi Zod.
  - Integrasi Laravel Sanctum (Stateful Authentication).
  - Fitur Lihat/Sembunyikan Password.
- **Layout Sistem**:
  - Topbar dengan navigasi brand.
  - Bottom Navigation mobile-first.
  - Struktur AppLayout dengan Outlet dinamis.

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
