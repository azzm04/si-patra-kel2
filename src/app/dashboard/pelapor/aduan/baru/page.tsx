// src/app/dashboard/pelapor/aduan/baru/page.tsx
import { prisma } from "@/lib/prisma";
import BuatAduanForm from "@/components/pelapor/BuatAduanForm";

export default async function BuatAduanPage() {
  // Ambil semua laporan yang sudah TERKIRIM atau DIVALIDASI
  // agar pelapor bisa merujuk laporan tertentu
  const laporanList = await prisma.laporanPenggunaan.findMany({
    where: {
      deletedAt: null,
      status: { in: ["TERKIRIM", "DIVALIDASI"] },
    },
    include: {
      mahasiswa: {
        include: {
          user:     { select: { name: true } },
          beasiswa: { select: { nama: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const options = laporanList.map((l) => ({
    id:       l.id,
    label:    `${l.mahasiswa.user.name} — ${l.semester} (${l.mahasiswa.beasiswa.nama})`,
  }));

  return <BuatAduanForm laporanOptions={options} />;
}