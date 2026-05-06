// src/app/dashboard/admin/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime, statusLaporanConfig, statusAduanConfig } from "@/lib/utils";
import { Users, FileText, AlertTriangle, BookOpen, CheckCircle, Clock } from "lucide-react";

export default async function AdminDashboard() {
  // ── Stats ────────────────────────────────────────────────────────────────
  const [
    totalMahasiswa,
    totalBeasiswa,
    totalLaporan,
    totalAduan,
    laporanPending,
    aduanPending,
    recentLaporan,
    recentAduan,
  ] = await Promise.all([
    prisma.mahasiswa.count(),
    prisma.beasiswa.count(),
    prisma.laporanPenggunaan.count({ where: { deletedAt: null } }),
    prisma.aduan.count(),
    prisma.laporanPenggunaan.count({ where: { status: "TERKIRIM", deletedAt: null } }),
    prisma.aduan.count({ where: { status: "MENUNGGU" } }),

    // JOIN: Laporan + Mahasiswa + User + Beasiswa
    prisma.laporanPenggunaan.findMany({
      where: { deletedAt: null },
      include: {
        mahasiswa: {
          include: {
            user: { select: { name: true } },
            beasiswa: { select: { nama: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Recent aduan
    prisma.aduan.findMany({
      include: {
        pelapor: { select: { name: true } },
        laporan: {
          include: {
            mahasiswa: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Total Mahasiswa",   value: totalMahasiswa,  icon: Users,          color: "bg-blue-50 text-blue-600" },
    { label: "Program Beasiswa",  value: totalBeasiswa,   icon: BookOpen,       color: "bg-purple-50 text-purple-600" },
    { label: "Total Laporan",     value: totalLaporan,    icon: FileText,       color: "bg-emerald-50 text-emerald-600" },
    { label: "Total Aduan",       value: totalAduan,      icon: AlertTriangle,  color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up" style={{ animationFillMode: "both" }}>
<<<<<<< HEAD
        <h1 className="text-xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ringkasan pengawasan dana beasiswa</p>
=======
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dashboard Admin</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ringkasan pengawasan dana beasiswa</p>
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
      </div>

      {(laporanPending > 0 || aduanPending > 0) && (
        <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
          {laporanPending > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800 shadow-sm transition-transform hover:scale-[1.02]">
              <Clock className="w-4 h-4 animate-pulse" />
              <span><strong>{laporanPending}</strong> laporan menunggu validasi</span>
            </div>
          )}
          {aduanPending > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-800 shadow-sm transition-transform hover:scale-[1.02]">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span><strong>{aduanPending}</strong> aduan baru perlu ditinjau</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="card animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover cursor-default group"
              style={{ animationDelay: `${150 + idx * 75}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between">
                <div>
<<<<<<< HEAD
                  <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
=======
                  <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:text-slate-400 transition-colors">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stat.value}</p>
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card animate-fade-in-up" style={{ animationDelay: "450ms", animationFillMode: "both" }}>
          <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
            <h2 className="font-semibold text-slate-900">Laporan Terbaru</h2>
=======
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Laporan Terbaru</h2>
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
            <a href="/dashboard/admin/laporan" className="text-xs text-primary-600 hover:underline hover:text-primary-700 transition-colors">
              Lihat semua
            </a>
          </div>
          <div className="space-y-3">
            {recentLaporan.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada laporan</p>
            ) : (
              recentLaporan.map((lap, idx) => {
                const cfg = statusLaporanConfig[lap.status];
                return (
                  <div 
                    key={lap.id} 
<<<<<<< HEAD
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 hover:translate-x-1 group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                        {lap.mahasiswa.user.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 transition-colors group-hover:text-slate-500">
=======
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:bg-slate-950/50 transition-all duration-200 hover:translate-x-1 group cursor-pointer border border-transparent hover:border-slate-100 dark:border-slate-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-700 transition-colors">
                        {lap.mahasiswa.user.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 transition-colors group-hover:text-slate-500 dark:text-slate-400">
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
                        {lap.semester} · {lap.mahasiswa.beasiswa.nama}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
<<<<<<< HEAD
                      <p className="text-sm font-semibold text-slate-800">
=======
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
                        {formatRupiah(lap.totalDana.toString())}
                      </p>
                      <span className={`badge text-[10px] mt-0.5 ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card animate-fade-in-up" style={{ animationDelay: "550ms", animationFillMode: "both" }}>
          <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
            <h2 className="font-semibold text-slate-900">Aduan Terbaru</h2>
=======
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Aduan Terbaru</h2>
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
            <a href="/dashboard/admin/aduan" className="text-xs text-primary-600 hover:underline hover:text-primary-700 transition-colors">
              Lihat semua
            </a>
          </div>
          <div className="space-y-3">
            {recentAduan.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada aduan</p>
            ) : (
              recentAduan.map((aduan) => {
                const cfg = statusAduanConfig[aduan.status];
                return (
                  <div 
                    key={aduan.id} 
<<<<<<< HEAD
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 hover:translate-x-1 group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary-700 transition-colors">{aduan.judul}</p>
                      <p className="text-xs text-slate-400 mt-0.5 transition-colors group-hover:text-slate-500">
=======
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:bg-slate-950/50 transition-all duration-200 hover:translate-x-1 group cursor-pointer border border-transparent hover:border-slate-100 dark:border-slate-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-700 transition-colors">{aduan.judul}</p>
                      <p className="text-xs text-slate-400 mt-0.5 transition-colors group-hover:text-slate-500 dark:text-slate-400">
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
                        {aduan.pelapor?.name ?? "Anonim"} · {formatDateTime(aduan.createdAt)}
                      </p>
                    </div>
                    <span className={`badge text-[10px] flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
