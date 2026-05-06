// prisma/seed.ts
import { PrismaClient, Role, Semester, KategoriItem } from "@prisma/client";
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

  // ── Pelapor dihapus — aduan sekarang dilakukan oleh mahasiswa ─────────────

  // ── Laporan Budi ─────────────────────────────────────────────────────────
  await prisma.laporanPenggunaan.create({
    data: {
      semester: Semester.GASAL,
      tahunAjaran: "2024/2025",
      totalDana: 4200000,
      catatan: "Penggunaan dana semester gasal untuk kebutuhan akademik",
      status: "DIVALIDASI",
      mahasiswaId: userBudi.mahasiswa!.id,
      items: {
        create: [
          { deskripsi: "Pembayaran SPP", nominal: 2000000, kategori: "SPP" },
          { deskripsi: "Buku teks Algoritma & Pemrograman", nominal: 350000, kategori: "BUKU" },
          { deskripsi: "Sewa kos bulan Juli-Desember", nominal: 1500000, kategori: "KOS" },
          { deskripsi: "Transportasi kuliah", nominal: 350000, kategori: "TRANSPORTASI"},
        ],
      },
    },
  });

  const laporanDrafBudi = await prisma.laporanPenggunaan.create({
    data: {
      semester: Semester.GENAP,
      tahunAjaran: "2024/2025",
      totalDana: 4200000,
      catatan: "Draft laporan semester genap",
      status: "DRAF",
      mahasiswaId: userBudi.mahasiswa!.id,
      items: {
        create: [
          { deskripsi: "Pembayaran SPP Genap", nominal: 2000000, kategori: "SPP" },
          { deskripsi: "Praktikum Jaringan Komputer", nominal: 500000, kategori: "PRAKTIKUM" },
        ],
      },
    },
  });

  // ── Laporan Sari ─────────────────────────────────────────────────────────
  await prisma.laporanPenggunaan.create({
    data: {
      semester: Semester.GASAL,
      tahunAjaran: "2024/2025",
      totalDana: 3500000,
      catatan: "Laporan penggunaan dana beasiswa Bidikmisi",
      status: "TERKIRIM",
      mahasiswaId: userSari.mahasiswa!.id,
      items: {
        create: [
          { deskripsi: "SPP Semester Gasal", nominal: 1800000, kategori: "SPP" },
          { deskripsi: "Buku referensi", nominal: 400000, kategori: "BUKU" },
          { deskripsi: "Biaya hidup (kos + makan)", nominal: 1300000, kategori: "BIAYA_HIDUP" },
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
      pelaporId: userBudi.id,
      laporanId: laporanDrafBudi.id,
    },
  });

  console.log("✅ Seed selesai!");
  console.log("\nAkun yang tersedia:");
  console.log("  Admin     : admin@sipatra.ac.id     / admin123");
  console.log("  Mahasiswa : budi@student.undip.ac.id / mahasiswa123");
  console.log("  Mahasiswa : sari@student.undip.ac.id / mahasiswa123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
