-- CreateEnum
CREATE TYPE "KategoriItem" AS ENUM ('SPP', 'BUKU', 'KOS', 'MAKAN', 'TRANSPORTASI', 'PRAKTIKUM', 'ALAT_TULIS', 'BIAYA_HIDUP', 'LAINNYA');

-- AlterTable: cast kategori string ke enum dengan mapping
ALTER TABLE "item_laporan"
  ALTER COLUMN "kategori" TYPE "KategoriItem"
  USING (
    CASE "kategori"
      WHEN 'SPP'          THEN 'SPP'::"KategoriItem"
      WHEN 'Buku'         THEN 'BUKU'::"KategoriItem"
      WHEN 'Kos'          THEN 'KOS'::"KategoriItem"
      WHEN 'Makan'        THEN 'MAKAN'::"KategoriItem"
      WHEN 'Transportasi' THEN 'TRANSPORTASI'::"KategoriItem"
      WHEN 'Praktikum'    THEN 'PRAKTIKUM'::"KategoriItem"
      WHEN 'Alat Tulis'   THEN 'ALAT_TULIS'::"KategoriItem"
      WHEN 'Biaya Hidup'  THEN 'BIAYA_HIDUP'::"KategoriItem"
      ELSE                     'LAINNYA'::"KategoriItem"
    END
  );

-- AlterTable
ALTER TABLE "mahasiswa"
  ALTER COLUMN "prodi" SET DATA TYPE VARCHAR(100),
  ALTER COLUMN "noHp"  SET DATA TYPE VARCHAR(13);
