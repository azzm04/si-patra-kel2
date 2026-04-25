# SI-PATRA — Sistem Informasi Pengawasan dan Transparansi Dana Beasiswa

Platform berbasis web untuk menjamin dana beasiswa tepat sasaran melalui sistem pelaporan dua arah.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, Server Components
- **Database**: PostgreSQL via Neon (cloud serverless)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (JWT strategy)
- **Validasi**: Zod

---

## Setup Lokal

### 1. Clone & Install

```bash
git clone <repo-url>
cd si-patra
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Neon PostgreSQL — dari https://console.neon.tech
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/sipatra?sslmode=require"

# Generate: openssl rand -base64 32
AUTH_SECRET="isi-secret-yang-kuat-di-sini"

NEXTAUTH_URL="http://localhost:3000"
```

### 3. Rename Folder NextAuth (WAJIB)

```bash
mv "src/app/api/auth/nextauth" "src/app/api/auth/[...nextauth]"
```

> Folder ini tidak bisa dibuat langsung karena karakter `[` dan `]` pada bash.

### 4. Setup Database

```bash
# Push schema ke Neon
npx prisma db push

# Generate Prisma client
npx prisma generate

# Isi data awal (seed)
npm run db:seed
```

### 5. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Akun Demo (setelah seed)

| Role       | Email                          | Password       |
|------------|--------------------------------|----------------|
| Admin      | admin@sipatra.ac.id            | admin123       |
| Mahasiswa  | budi@student.undip.ac.id       | mahasiswa123   |
| Mahasiswa  | sari@student.undip.ac.id       | mahasiswa123   |
| Pelapor    | eko@gmail.com                  | pelapor123     |

---

## Struktur Project

```
si-patra/
├── prisma/
│   ├── schema.prisma          # 6 model: User, Beasiswa, Mahasiswa, LaporanPenggunaan, ItemLaporan, Aduan
│   └── seed.ts                # Data awal untuk development
├── src/
│   ├── app/
│   │   ├── auth/login/        # Halaman login
│   │   ├── dashboard/
│   │   │   ├── admin/         # Dashboard, mahasiswa, beasiswa, laporan, aduan
│   │   │   ├── mahasiswa/     # Dashboard, list laporan, detail laporan, buat laporan
│   │   │   └── pelapor/       # Dashboard, kirim aduan
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # NextAuth handler
│   │       ├── laporan/             # CRUD laporan
│   │       ├── aduan/               # CRUD aduan
│   │       └── admin/               # Admin endpoints (laporan, aduan, users, beasiswa)
│   ├── components/
│   │   ├── admin/             # AdminLaporanActions, AdminAduanActions, SoftDeleteButton, BeasiswaForm
│   │   ├── mahasiswa/         # HardDeleteButton, SubmitLaporanButton
│   │   └── layout/            # Sidebar, TopBar
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   └── utils.ts           # formatRupiah, formatDate, status configs
│   ├── middleware.ts           # Route guard berbasis role
│   └── types/
│       └── next-auth.d.ts     # Type extension session
└── README.md
```

---

## Fitur yang Diimplementasi

### Mahasiswa
- [x] Dashboard dengan kartu info beasiswa & statistik
- [x] Buat laporan penggunaan dana (multi-item dinamis)
- [x] Simpan sebagai Draf atau langsung Kirim
- [x] **Hard Delete** draf laporan (dengan konfirmasi)
- [x] Kirim draf ke admin (ubah status DRAF → TERKIRIM)
- [x] Detail laporan: rincian item, distribusi kategori, timeline status
- [x] Progress bar visualisasi per item

### Admin
- [x] Dashboard dengan statistik JOIN 4 tabel
- [x] Manajemen mahasiswa dengan filter + search
- [x] **Soft Delete** akun mahasiswa (nonaktif/aktif)
- [x] Manajemen program beasiswa (CRUD)
- [x] Validasi / penolakan laporan dengan catatan
- [x] Manajemen aduan dengan workflow status
- [x] Query JOIN kompleks (Laporan + Mahasiswa + User + Beasiswa)

### Pelapor
- [x] Dashboard riwayat aduan
- [x] Form kirim aduan dengan URL bukti
- [x] Lihat status & catatan admin

### Keamanan
- [x] JWT-based authentication (NextAuth v5)
- [x] Middleware route guard berbasis role
- [x] Zod validation di semua API endpoint
- [x] Password di-hash dengan bcrypt

---

## Database Schema

```
User ──── Mahasiswa ──── Beasiswa
  │           │
  │           └──── LaporanPenggunaan ──── ItemLaporan
  │                       │
  └──── Aduan ────────────┘
```

**Relasi penting:**
- `User` 1:1 `Mahasiswa` (setiap mahasiswa punya akun)
- `Mahasiswa` N:1 `Beasiswa` (banyak mahasiswa per program)
- `Mahasiswa` 1:N `LaporanPenggunaan`
- `LaporanPenggunaan` 1:N `ItemLaporan` (cascade delete)
- `Aduan` opsional terhubung ke `LaporanPenggunaan` dan `User` (pelapor)

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema ke database
npm run db:seed      # Isi data awal
npm run db:studio    # Buka Prisma Studio (GUI database)
npm run db:generate  # Generate Prisma client
```
