-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MAHASISWA');

-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('DRAF', 'TERKIRIM', 'DIVALIDASI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusAduan" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusBeasiswa" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('GASAL', 'GENAP');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MAHASISWA',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beasiswa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "penyelenggara" TEXT NOT NULL,
    "kuota" SMALLINT NOT NULL,
    "nominalPerSemester" DECIMAL(15,2) NOT NULL,
    "status" "StatusBeasiswa" NOT NULL DEFAULT 'AKTIF',
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" TEXT NOT NULL,
    "nim" VARCHAR(20) NOT NULL,
    "prodi" TEXT NOT NULL,
    "angkatan" SMALLINT NOT NULL,
    "noHp" TEXT,
    "alamat" TEXT,
    "userId" TEXT NOT NULL,
    "beasiswaId" TEXT NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan_penggunaan" (
    "id" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "tahunAjaran" VARCHAR(9) NOT NULL,
    "totalDana" DECIMAL(15,2) NOT NULL,
    "catatan" TEXT,
    "status" "StatusLaporan" NOT NULL DEFAULT 'DRAF',
    "catatanAdmin" TEXT,
    "deletedAt" TIMESTAMP(3),
    "mahasiswaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laporan_penggunaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_laporan" (
    "id" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "nominal" DECIMAL(15,2) NOT NULL,
    "kategori" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aduan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "buktiUrl" TEXT,
    "status" "StatusAduan" NOT NULL DEFAULT 'MENUNGGU',
    "catatanAdmin" TEXT,
    "pelaporId" TEXT NOT NULL,
    "laporanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aduan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_userId_key" ON "mahasiswa"("userId");

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_beasiswaId_fkey" FOREIGN KEY ("beasiswaId") REFERENCES "beasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_penggunaan" ADD CONSTRAINT "laporan_penggunaan_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_laporan" ADD CONSTRAINT "item_laporan_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "laporan_penggunaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aduan" ADD CONSTRAINT "aduan_pelaporId_fkey" FOREIGN KEY ("pelaporId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aduan" ADD CONSTRAINT "aduan_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "laporan_penggunaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
