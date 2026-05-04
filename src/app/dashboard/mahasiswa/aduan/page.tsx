// src/app/dashboard/mahasiswa/aduan/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, statusAduanConfig } from "@/lib/utils";
import Link from "next/link";
import {
  PlusCircle,
  AlertTriangle,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";

export default async function PelaporAduanPage() {
  const session = await auth();

  const aduan = await prisma.aduan.findMany({
    where: { pelaporId: session!.user.id },
    include: {
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
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    total:    aduan.length,
    menunggu: aduan.filter((a) => a.status === "MENUNGGU").length,
    diproses: aduan.filter((a) => a.status === "DIPROSES").length,
    selesai:  aduan.filter((a) => a.status === "SELESAI").length,
    ditolak:  aduan.filter((a) => a.status === "DITOLAK").length,
  };

  const statusIcon: Record<string, React.ElementType> = {
    MENUNGGU: Clock,
    DIPROSES: Loader,
    SELESAI:  CheckCircle,
    DITOLAK:  XCircle,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Aduan Saya</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Riwayat semua aduan yang telah Anda kirimkan
          </p>
        </div>
        <Link href="/dashboard/mahasiswa/aduan/baru" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Kirim Aduan Baru
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: counts.total,    color: "bg-slate-50  text-slate-700  border-slate-200"  },
          { label: "Menunggu", value: counts.menunggu, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
          { label: "Diproses", value: counts.diproses, color: "bg-blue-50   text-blue-700   border-blue-200"   },
          { label: "Selesai",  value: counts.selesai,  color: "bg-green-50  text-green-700  border-green-200"  },
        ].map((s, idx) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color} animate-fade-in-up`} style={{ animationDelay: `${100 + idx * 50}ms`, animationFillMode: "both" }}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 animate-fade-in-up" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-semibold">Kerahasiaan Identitas</p>
          <p className="mt-0.5">
            Identitas Anda sebagai pelapor dijaga kerahasiaannya oleh admin dan
            tidak akan diungkapkan kepada pihak yang diadukan.
          </p>
        </div>
      </div>

      {aduan.length === 0 ? (
        <div className="card text-center py-14 animate-fade-in-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
          <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-medium text-slate-600">Belum ada aduan</p>
          <p className="text-sm text-slate-400 mt-1">
            Jika Anda mengetahui indikasi penyalahgunaan dana beasiswa,
            segera laporkan.
          </p>
          <Link
            href="/dashboard/mahasiswa/aduan/baru"
            className="btn-primary btn-sm mt-4 inline-flex"
          >
            <PlusCircle className="w-4 h-4" />
            Kirim Aduan Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {aduan.map((a) => {
            const cfg  = statusAduanConfig[a.status];
            const Icon = statusIcon[a.status] ?? Clock;

            return (
              <div
                key={a.id}
                className="card hover:shadow-card-hover transition-shadow space-y-3 animate-fade-in-up"
                style={{ animationDelay: "400ms", animationFillMode: "both" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 leading-snug">
                        {a.judul}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Dikirim {formatDateTime(a.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 ml-12">
                  {a.deskripsi}
                </p>

                <div className="ml-12 flex flex-wrap items-center gap-3">
                  {a.buktiUrl && (
                    <a
                      href={a.buktiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Lihat Bukti
                    </a>
                  )}
                  {a.laporan && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      Terkait:{" "}
                      <span className="font-medium text-slate-700">
                        {a.laporan.mahasiswa.user.name}
                      </span>
                      &nbsp;·&nbsp;{a.laporan.semester}
                      &nbsp;·&nbsp;{a.laporan.mahasiswa.beasiswa.nama}
                    </div>
                  )}
                </div>

                {a.catatanAdmin && (
                  <div className="ml-12 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Tanggapan Admin
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {a.catatanAdmin}
                    </p>
                  </div>
                )}

                {a.status === "DITOLAK" && !a.catatanAdmin && (
                  <div className="ml-12 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">
                      Aduan ini tidak dapat diproses lebih lanjut oleh admin.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}