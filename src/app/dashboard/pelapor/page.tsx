// src/app/dashboard/pelapor/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, statusAduanConfig } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, AlertTriangle } from "lucide-react";

export default async function PelaporDashboard() {
  const session = await auth();

  const aduan = await prisma.aduan.findMany({
    where: { pelaporId: session!.user.id },
    include: {
      laporan: {
        include: {
          mahasiswa: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Pelapor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pantau status aduan yang telah Anda kirimkan</p>
        </div>
        <Link href="/dashboard/pelapor/aduan/baru" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Kirim Aduan
        </Link>
      </div>

      <div className="card bg-amber-50 border-amber-200 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Panduan Aduan</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Pastikan aduan disertai bukti yang valid. Aduan palsu atau tidak berdasar dapat dikenai sanksi.
              Identitas pelapor dijaga kerahasiaannya oleh admin.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Aduan Saya ({aduan.length})</h2>

        {aduan.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Belum ada aduan yang dikirim</p>
            <Link href="/dashboard/pelapor/aduan/baru" className="btn-primary btn-sm mt-3 inline-flex">
              Kirim Aduan Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {aduan.map((a) => {
              const cfg = statusAduanConfig[a.status];
              return (
                <div key={a.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{a.judul}</p>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{a.deskripsi}</p>
                      {a.laporan && (
                        <p className="text-xs text-slate-400 mt-1">
                          Terkait: {a.laporan.mahasiswa.user.name} · {a.laporan.semester}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{formatDateTime(a.createdAt)}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  {a.catatanAdmin && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-1">Catatan Admin</p>
                      <p className="text-sm text-slate-700">{a.catatanAdmin}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
