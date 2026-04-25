// src/app/dashboard/pelapor/aduan/baru/page.tsx
import { prisma } from "@/lib/prisma";
import BuatAduanForm from "@/components/pelapor/BuatAduanForm";

export default async function BuatAduanPage() {
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

  const seen = new Set<string>();
  const unique = laporanList.filter((l) => {
    if (seen.has(l.mahasiswaId)) return false;
    seen.add(l.mahasiswaId);
    return true;
  });

  const options = unique.map((l) => ({
    id:    l.id,
    label: `${l.mahasiswa.user.name} (${l.mahasiswa.beasiswa.nama})`,
  }));

  return <BuatAduanForm laporanOptions={options} />;
}