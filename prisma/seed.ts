// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean up ──────────────────────────────────────────────────────────────
  await prisma.aduan.deleteMany();
  await prisma.itemLaporan.deleteMany();
  await prisma.laporanPenggunaan.deleteMany();
  await prisma.mahasiswa.deleteMany();
  await prisma.user.deleteMany();
  await prisma.beasiswa.deleteMany();

  // ── Beasiswa ──────────────────────────────────────────────────────────────
  const kipK = await prisma.beasiswa.create({
    data: {
      nama: "KIP-Kuliah",
      penyelenggara: "Kemdikbudristek",
      kuota: 50,
      nominalPerSemester: 4200000,
      deskripsi: "Kartu Indonesia Pintar Kuliah untuk mahasiswa kurang mampu berprestasi",
    },
  });

  const bidikmisi = await prisma.beasiswa.create({
    data: {
      nama: "Beasiswa Bidikmisi",
      penyelenggara: "Universitas Diponegoro",
      kuota: 20,
      nominalPerSemester: 3500000,
      deskripsi: "Beasiswa internal Undip untuk mahasiswa berprestasi",
    },
  });

  // ── Admin ─────────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      name: "Administrator SI-PATRA",
      email: "admin@sipatra.ac.id",
      password: await bcrypt.hash("admin123", 10),
      role: Role.ADMIN,
    },
  });

  // ── Mahasiswa 1 ───────────────────────────────────────────────────────────
  const userBudi = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi@student.undip.ac.id",
      password: await bcrypt.hash("mahasiswa123", 10),
      role: Role.MAHASISWA,
      mahasiswa: {
        create: {
          nim: "21120123140001",
          prodi: "Teknik Komputer",
          angkatan: 2023,
          noHp: "081234567890",
          beasiswaId: kipK.id,
        },
      },
    },
    include: { mahasiswa: true },
  });

  // ── Mahasiswa 2 ───────────────────────────────────────────────────────────
  const userSari = await prisma.user.create({
    data: {
      name: "Sari Dewi Rahayu",
      email: "sari@student.undip.ac.id",
      password: await bcrypt.hash("mahasiswa123", 10),
      role: Role.MAHASISWA,
      mahasiswa: {
        create: {
          nim: "21120123140002",
          prodi: "Teknik Informatika",
          angkatan: 2023,
          noHp: "087654321098",
          beasiswaId: bidikmisi.id,
        },
      },
    },
    include: { mahasiswa: true },
  });

  // ── Pelapor ───────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      name: "Eko Prasetyo",
      email: "eko@gmail.com",
      password: await bcrypt.hash("pelapor123", 10),
      role: Role.PELAPOR,
    },
  });

  // ── Laporan Budi ─────────────────────────────────────────────────────────
  await prisma.laporanPenggunaan.create({
    data: {
      semester: "Gasal 2024/2025",
      totalDana: 4200000,
      catatan: "Penggunaan dana semester gasal untuk kebutuhan akademik",
      status: "DIVALIDASI",
      mahasiswaId: userBudi.mahasiswa!.id,
      items: {
        create: [
          { deskripsi: "Pembayaran SPP", nominal: 2000000, kategori: "SPP" },
          { deskripsi: "Buku teks Algoritma & Pemrograman", nominal: 350000, kategori: "Buku" },
          { deskripsi: "Sewa kos bulan Juli-Desember", nominal: 1500000, kategori: "Kos" },
          { deskripsi: "Transportasi kuliah", nominal: 350000, kategori: "Transportasi" },
        ],
      },
    },
  });

  const laporanDrafBudi = await prisma.laporanPenggunaan.create({
    data: {
      semester: "Genap 2024/2025",
      totalDana: 4200000,
      catatan: "Draft laporan semester genap",
      status: "DRAF",
      mahasiswaId: userBudi.mahasiswa!.id,
      items: {
        create: [
          { deskripsi: "Pembayaran SPP Genap", nominal: 2000000, kategori: "SPP" },
          { deskripsi: "Praktikum Jaringan Komputer", nominal: 500000, kategori: "Praktikum" },
        ],
      },
    },
  });

  // ── Laporan Sari ─────────────────────────────────────────────────────────
  await prisma.laporanPenggunaan.create({
    data: {
      semester: "Gasal 2024/2025",
      totalDana: 3500000,
      catatan: "Laporan penggunaan dana beasiswa Bidikmisi",
      status: "TERKIRIM",
      mahasiswaId: userSari.mahasiswa!.id,
      items: {
        create: [
          { deskripsi: "SPP Semester Gasal", nominal: 1800000, kategori: "SPP" },
          { deskripsi: "Buku referensi", nominal: 400000, kategori: "Buku" },
          { deskripsi: "Biaya hidup (kos + makan)", nominal: 1300000, kategori: "Biaya Hidup" },
        ],
      },
    },
  });

  // ── Aduan ─────────────────────────────────────────────────────────────────
  await prisma.aduan.create({
    data: {
      judul: "Indikasi penggunaan dana tidak sesuai",
      deskripsi:
        "Terdapat indikasi penerima beasiswa menggunakan dana untuk keperluan non-akademik berdasarkan informasi dari rekan mahasiswa.",
      status: "MENUNGGU",
      laporanId: laporanDrafBudi.id,
    },
  });

  // ── Email Whitelist ───────────────────────────────────────────────
await prisma.emailWhitelist.deleteMany();

// Whitelist Bidikmisi
const bidikmisiEmails = [
  "farisrevan13@gmail.com",
  "aisyahaprilia1515@gmail.com",
  "handoyoboruto@gmail.com",
  "hansendu99@gmail.com",
];

// Whitelist KIP-Kuliah
const kipkEmails = [
  "azzamsyaifull@gmail.com",
  "mustofaahmadrusli@gmail.com",
  "indonesia369@gmail.com",
  "nanditoadi@gmail.com",
];

for (const email of bidikmisiEmails) {
  await prisma.emailWhitelist.create({
    data: { email: email.toLowerCase(), beasiswaId: bidikmisi.id },
  });
}

for (const email of kipkEmails) {
  await prisma.emailWhitelist.create({
    data: { email: email.toLowerCase(), beasiswaId: kipK.id },
  });
}

console.log("✅ Email whitelist ditambahkan:");
console.log("  Bidikmisi:", bidikmisiEmails.length, "email");
console.log("  KIP-K    :", kipkEmails.length, "email");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
