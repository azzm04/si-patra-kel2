// src/app/dashboard/admin/laporan/page.tsx
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate, statusLaporanConfig } from "@/lib/utils";
import AdminLaporanActions from "@/components/admin/AdminLaporanActions";
import { Search } from "lucide-react";

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

  // JOIN kompleks: LaporanPenggunaan + Mahasiswa + User + Beasiswa + ItemLaporan
  const laporan = await prisma.laporanPenggunaan.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { tahunAjaran: { contains: search, mode: "insensitive" as const } },
              { mahasiswa: { user: { name: { contains: search, mode: "insensitive" as const } } } },
              { mahasiswa: { nim: { contains: search, mode: "insensitive" as const } } },
              { mahasiswa: { beasiswa: { nama: { contains: search, mode: "insensitive" as const } } } },
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
    { value: "DRAF", label: "Draf" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Manajemen Laporan</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Validasi laporan penggunaan dana beasiswa ({laporan.length} laporan)
        </p>
      </div>

      <div className="card p-4">
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

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left font-medium text-slate-500 px-4 py-3">Mahasiswa</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Beasiswa</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Semester</th>
                <th className="text-right font-medium text-slate-500 px-4 py-3">Total Dana</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Item</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">Aduan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {laporan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-12">
                    Tidak ada laporan ditemukan
                  </td>
                </tr>
              ) : (
                laporan.map((lap) => {
                  const cfg = statusLaporanConfig[lap.status];
                  return (
                    <tr key={lap.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{lap.mahasiswa.user.name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {lap.mahasiswa.nim}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{lap.mahasiswa.beasiswa.nama}</td>
                      <td className="px-4 py-3 text-slate-700">{lap.semester}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {formatRupiah(lap.totalDana.toString())}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{lap.items.length} item</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {lap._count.aduan > 0 ? (
                          <span className="badge bg-red-100 text-red-700">
                            {lap._count.aduan} aduan
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <AdminLaporanActions
                          laporanId={lap.id}
                          currentStatus={lap.status}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
