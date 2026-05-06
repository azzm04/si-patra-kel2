// src/app/dashboard/mahasiswa/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate, statusLaporanConfig } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default async function MahasiswaDashboard() {
  const session = await auth();

  // Ambil data mahasiswa beserta beasiswa dan laporan
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session!.user.id },
    include: {
      beasiswa: true,
      laporan: {
        where: { deletedAt: null },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!mahasiswa) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Data mahasiswa tidak ditemukan. Hubungi admin.</p>
      </div>
    );
  }

  const totalLaporan = mahasiswa.laporan.length;
  const laporanValidasi = mahasiswa.laporan.filter((l) => l.status === "DIVALIDASI").length;
  const laporanPending = mahasiswa.laporan.filter((l) => l.status === "TERKIRIM").length;
  const totalDicairkan = mahasiswa.laporan
    .filter((l) => l.status === "DIVALIDASI")
    .reduce((sum, l) => sum + Number(l.totalDana), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dashboard Mahasiswa</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Pantau laporan penggunaan dana beasiswa Anda</p>
        </div>
        <Link href="/dashboard/mahasiswa/laporan/baru" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Buat Laporan
        </Link>
      </div>

      <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-200 text-xs font-medium uppercase tracking-widest">Program Beasiswa</p>
            <h2 className="text-xl font-bold mt-1">{mahasiswa.beasiswa.nama}</h2>
            <p className="text-primary-200 text-sm mt-0.5">{mahasiswa.beasiswa.penyelenggara}</p>
          </div>
          <div className="text-right">
            <p className="text-primary-200 text-xs">Dana per Semester</p>
            <p className="text-2xl font-bold mt-1">
              {formatRupiah(mahasiswa.beasiswa.nominalPerSemester.toString())}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-4 text-sm">
          <span className="text-primary-200">NIM: <span className="text-white font-mono">{mahasiswa.nim}</span></span>
          <span className="text-primary-200">Prodi: <span className="text-white">{mahasiswa.prodi}</span></span>
          <span className="text-primary-200">Angkatan: <span className="text-white">{mahasiswa.angkatan}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Laporan",   value: totalLaporan,    icon: FileText,     color: "bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400" },
          { label: "Tervalidasi",     value: laporanValidasi, icon: CheckCircle,  color: "bg-green-50 text-green-600" },
          { label: "Menunggu",        value: laporanPending,  icon: Clock,        color: "bg-amber-50 text-amber-600" },
          { label: "Total Dicairkan", value: formatRupiah(totalDicairkan), icon: AlertCircle, color: "bg-blue-50 text-blue-600", isRupiah: true },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card animate-fade-in-up" style={{ animationDelay: `${200 + idx * 50}ms`, animationFillMode: "both" }}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="card animate-fade-in-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Laporan Saya</h2>
          <Link href="/dashboard/mahasiswa/laporan" className="text-xs text-primary-600 hover:underline">
            Lihat semua
          </Link>
        </div>

        {mahasiswa.laporan.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Belum ada laporan</p>
            <Link href="/dashboard/mahasiswa/laporan/baru" className="btn-primary btn-sm mt-3 inline-flex">
              Buat Laporan Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {mahasiswa.laporan.slice(0, 5).map((lap) => {
              const cfg = statusLaporanConfig[lap.status];
              return (
                <Link
                  key={lap.id}
                  href={`/dashboard/mahasiswa/laporan/${lap.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:bg-slate-950/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lap.semester}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{lap.items.length} item · {formatDate(lap.createdAt)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-shrink-0">
                    {formatRupiah(lap.totalDana.toString())}
                  </p>
                  <span className={`badge flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
