// src/app/dashboard/mahasiswa/laporan/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  formatRupiah,
  formatDate,
  formatDateTime,
  statusLaporanConfig,
} from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Send,
  Edit,
} from "lucide-react";
import SubmitLaporanButton from "@/components/mahasiswa/SubmitLaporanButton";
import SoftDeleteButton from "@/components/mahasiswa/SoftDeleteButton"; // 2. Import komponen tombol hapus milikmu

export default async function DetailLaporanPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session!.user.id },
  });
  if (!mahasiswa) redirect("/dashboard/mahasiswa");

  const laporan = await prisma.laporanPenggunaan.findFirst({
    where: { id: params.id, mahasiswaId: mahasiswa.id, deletedAt: null },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      mahasiswa: {
        include: {
          beasiswa: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!laporan) notFound();

  const cfg = statusLaporanConfig[laporan.status];

  // Hitung persentase per kategori
  const totalNum = Number(laporan.totalDana);
  const byKategori: Record<string, number> = {};
  laporan.items.forEach((item) => {
    byKategori[item.kategori] =
      (byKategori[item.kategori] ?? 0) + Number(item.nominal);
  });

  const statusTimeline = [
    {
      label: "Draf Dibuat",
      date: formatDateTime(laporan.createdAt),
      done: true,
      icon: FileText,
    },
    {
      label: "Dikirim ke Admin",
      date:
        laporan.status !== "DRAF"
          ? formatDateTime(laporan.updatedAt)
          : "Belum dikirim",
      done: laporan.status !== "DRAF",
      icon: Send,
    },
    {
      label:
        laporan.status === "DITOLAK" ? "Ditolak Admin" : "Divalidasi Admin",
      date:
        laporan.status === "DIVALIDASI" || laporan.status === "DITOLAK"
          ? formatDateTime(laporan.updatedAt)
          : "Menunggu",
      done: laporan.status === "DIVALIDASI" || laporan.status === "DITOLAK",
      icon: laporan.status === "DITOLAK" ? XCircle : CheckCircle,
      isReject: laporan.status === "DITOLAK",
    },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <Link href="/dashboard/mahasiswa/laporan" className="btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{laporan.semester}</h1>
            <span className={`badge ${cfg.color}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {laporan.mahasiswa.beasiswa.nama} · Dibuat {formatDate(laporan.createdAt)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {laporan.status !== "DIVALIDASI" && (
            <>
              <Link
                href={`/dashboard/mahasiswa/laporan/${laporan.id}/edit`}
                className="btn-secondary btn-sm flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <SoftDeleteButton laporanId={laporan.id} semester={laporan.semester} />
            </>
          )}

          {/* Tombol Kirim hanya muncul jika statusnya masih DRAF */}
          {laporan.status === "DRAF" && (
            <SubmitLaporanButton laporanId={laporan.id} />
          )}
        </div>
        {/* --- AKHIR BAGIAN ACTION BUTTONS --- */}
        
      </div>

      {laporan.status === "DITOLAK" && laporan.catatanAdmin && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex gap-2 items-start">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Laporan Ditolak</p>
              <p className="text-sm text-red-700 mt-1">{laporan.catatanAdmin}</p>
            </div>
          </div>
        </div>
      )}

      {laporan.status === "DITOLAK" && laporan.catatanAdmin && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex gap-2 items-start">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Laporan Ditolak
              </p>
              <p className="text-sm text-red-700 mt-1">
                {laporan.catatanAdmin}
              </p>
            </div>
          </div>
        </div>
      )}

      {laporan.status === "DIVALIDASI" && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <div className="flex gap-2 items-start">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                Laporan Divalidasi
              </p>
              {laporan.catatanAdmin ? (
                <p className="text-sm text-green-700 mt-1">
                  {laporan.catatanAdmin}
                </p>
              ) : (
                <p className="text-sm text-green-600 mt-1">
                  Laporan Anda telah diverifikasi oleh admin.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Rincian Penggunaan Dana
              </h2>
              <p className="text-sm font-bold text-primary-700">
                {formatRupiah(laporan.totalDana.toString())}
              </p>
            </div>

            <div className="space-y-2">
              {laporan.items.map((item, idx) => {
                const pct =
                  totalNum > 0
                    ? ((Number(item.nominal) / totalNum) * 100).toFixed(1)
                    : "0";
                return (
                  <div key={item.id} className="group">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium text-slate-400 tabular-nums w-5 flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 truncate">
                          {item.deskripsi}
                        </span>
                        <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] flex-shrink-0">
                          {item.kategori}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0 ml-2">
                        {formatRupiah(item.nominal.toString())}
                      </span>
                    </div>
                    <div className="ml-7 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="ml-7 text-[10px] text-slate-400 mt-0.5">
                      {pct}% dari total
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">TOTAL</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatRupiah(laporan.totalDana.toString())}
              </span>
            </div>
          </div>

          {laporan.catatan && (
            <div className="card">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Catatan</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {laporan.catatan}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
          <div className="card">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Distribusi Kategori
            </h2>
            <div className="space-y-2.5">
              {Object.entries(byKategori)
                .sort(([, a], [, b]) => b - a)
                .map(([kat, nominal]) => {
                  const pct = totalNum > 0 ? (nominal / totalNum) * 100 : 0;
                  return (
                    <div key={kat}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          {kat}
                        </span>
                        <span className="text-slate-400">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 text-right">
                        {formatRupiah(nominal)}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Timeline Status
            </h2>
            <div className="space-y-4">
              {statusTimeline.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          step.done
                            ? step.isReject
                              ? "bg-red-100 text-red-500"
                              : "bg-green-100 text-green-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {idx < statusTimeline.length - 1 && (
                        <div
                          className={`w-px flex-1 mt-1 ${
                            step.done ? "bg-green-200" : "bg-slate-100 dark:bg-slate-800"
                          }`}
                          style={{ minHeight: "20px" }}
                        />
                      )}
                    </div>
                    <div className="pb-2">
                      <p
                        className={`text-sm font-medium ${
                          step.done
                            ? step.isReject
                              ? "text-red-700"
                              : "text-slate-900 dark:text-slate-100"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {step.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
