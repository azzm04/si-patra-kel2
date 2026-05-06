// src/app/dashboard/admin/aduan/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDateTime, statusAduanConfig } from "@/lib/utils";
import { AlertTriangle, ExternalLink, Clock, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import AdminAduanActions from "@/components/admin/AdminAduanActions";

interface SearchParams { status?: string }

export default async function AdminAduanPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = searchParams;

  const aduan = await prisma.aduan.findMany({
    where: status ? { status: status as any } : {},
    include: {
      pelapor: { select: { name: true, email: true } },
      laporan: {
        include: {
          mahasiswa: {
            include: {
              user:     { select: { name: true } },
              beasiswa: { select: { nama: true } },
            },
          },
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const counts = {
    total:    aduan.length,
    menunggu: aduan.filter((a) => a.status === "MENUNGGU").length,
    diproses: aduan.filter((a) => a.status === "DIPROSES").length,
    selesai:  aduan.filter((a) => a.status === "SELESAI").length,
    ditolak:  aduan.filter((a) => a.status === "DITOLAK").length,
  };

  const statusOptions = [
    { value: "",          label: "Semua" },
    { value: "MENUNGGU",  label: "Menunggu" },
    { value: "DIPROSES",  label: "Diproses" },
    { value: "SELESAI",   label: "Selesai" },
    { value: "DITOLAK",   label: "Ditolak" },
  ];

  return (
    <div className="space-y-5">
      <div className="animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manajemen Aduan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Tinjau dan proses laporan indikasi penyalahgunaan dana
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Menunggu", value: counts.menunggu, icon: Clock, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
          { label: "Diproses", value: counts.diproses, icon: RefreshCw, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Selesai",  value: counts.selesai,  icon: CheckCircle, color: "bg-green-50 text-green-700 border-green-200" },
          { label: "Ditolak",  value: counts.ditolak,  icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.label} 
              className={`card py-3 flex flex-col items-center justify-center border ${s.color} animate-fade-in-up transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover cursor-default group`}
              style={{ animationDelay: `${100 + idx * 50}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300" />
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
              <p className="text-xs font-medium mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit animate-fade-in-up" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
        {statusOptions.map((opt) => (
          <a
            key={opt.value}
            href={opt.value ? `?status=${opt.value}` : "?"}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              (status ?? "") === opt.value
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {aduan.length === 0 ? (
          <div className="card text-center py-12">
            <AlertTriangle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Tidak ada aduan ditemukan</p>
          </div>
        ) : (
          aduan.map((a, idx) => {
            const cfg = statusAduanConfig[a.status];
            return (
              <div 
                key={a.id} 
                className="card space-y-3 animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover border border-transparent hover:border-slate-200 dark:border-slate-800"
                style={{ animationDelay: `${400 + idx * 50}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 break-words line-clamp-2">{a.judul}</h3>
                      <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Dilaporkan oleh{" "}
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {a.pelapor?.name ?? "Anonim"}
                      </span>{" "}
                      · {formatDateTime(a.createdAt)}
                    </p>
                  </div>
                  <AdminAduanActions aduanId={a.id} currentStatus={a.status} />
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{a.deskripsi}</p>

                {a.buktiUrl && (
                  <a
                    href={a.buktiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Lihat Bukti
                  </a>
                )}

                {a.laporan && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-sm">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Laporan yang Diadukan</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {a.laporan.mahasiswa.user.name}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 dark:text-slate-400">{a.laporan.semester}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 dark:text-slate-400">{a.laporan.mahasiswa.beasiswa.nama}</span>
                    </div>
                  </div>
                )}

                {a.catatanAdmin && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs font-medium text-blue-600 mb-1">Catatan Admin</p>
                    <p className="text-sm text-blue-800">{a.catatanAdmin}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
