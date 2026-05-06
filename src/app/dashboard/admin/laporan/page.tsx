// src/app/dashboard/admin/laporan/page.tsx
import { prisma } from "@/lib/prisma";
import { formatRupiah, statusLaporanConfig } from "@/lib/utils";
import { Search } from "lucide-react";

// 1. Impor komponen LaporanRowAdmin yang baru kita buat
import LaporanRowAdmin from "@/components/admin/LaporanRowAdmin";

interface SearchParams {
  search?: string;
  status?: string;
}

export default async function AdminLaporanPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search, status } = searchParams;

  const laporan = await prisma.laporanPenggunaan.findMany({
    where: {
      deletedAt: null,
      // 2. Pastikan filter status "DRAF" di-exclude dari tabel Admin
      status: status ? (status as any) : { not: "DRAF" },
      ...(search
        ? {
            OR: [
              {
                tahunAjaran: { contains: search, mode: "insensitive" as const },
              },
              {
                mahasiswa: {
                  user: {
                    name: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
              {
                mahasiswa: {
                  nim: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                mahasiswa: {
                  beasiswa: {
                    nama: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      mahasiswa: {
        include: {
          user: { select: { name: true, email: true } },
          beasiswa: { select: { nama: true, nominalPerSemester: true } },
        },
      },
      items: true,
      _count: { select: { aduan: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "TERKIRIM", label: "Terkirim" },
    { value: "DIVALIDASI", label: "Divalidasi" },
    { value: "DITOLAK", label: "Ditolak" },
  ];

  return (
    <div className="space-y-5">
      <div className="animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manajemen Laporan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Validasi laporan penggunaan dana beasiswa ({laporan.length} laporan)
        </p>
      </div>

      <div className="card p-4 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
        <form className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Cari nama, NIM, beasiswa, semester..."
              className="input pl-10 text-sm"
            />
          </div>
          <select
            name="status"
            defaultValue={status}
            className="input w-auto text-sm"
            title="status"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary btn-sm px-4 py-2">
            Filter
          </button>
        </form>
      </div>

      <div className="card p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/50">
                <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-4 py-3">
                  Mahasiswa
                </th>
                <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-4 py-3">
                  Beasiswa
                </th>
                <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-4 py-3">
                  Semester
                </th>
                <th className="text-right font-medium text-slate-500 dark:text-slate-400 px-4 py-3">
                  Total Dana
                </th>
                <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-4 py-3">
                  Item
                </th>
                <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-4 py-3">
                  Status
                </th>
                <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-4 py-3">
                  Aduan
                </th>
                <th className="px-4 py-3 w-28">Aksi</th>
              </tr>
            </thead>

            {/* 3. Render Table Body */}
            <tbody className="divide-y divide-slate-50">
              {laporan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-12">
                    Tidak ada laporan ditemukan
                  </td>
                </tr>
              ) : (
                laporan.map((lap) => {
                  // Serialize data karena akan dilempar ke Client Component (LaporanRowAdmin)
                  // Mencegah error "Decimal objects are not supported"
                  const serializedLap = JSON.parse(JSON.stringify(lap));

                  return <LaporanRowAdmin key={lap.id} lap={serializedLap} />;
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
