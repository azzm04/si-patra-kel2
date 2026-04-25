// src/app/dashboard/mahasiswa/laporan/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate, statusLaporanConfig } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, FileText, ChevronRight, Trash2 } from "lucide-react";
import HardDeleteButton from "@/components/mahasiswa/HardDeleteButton";

export default async function MahasiswaLaporanPage() {
  const session = await auth();

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session!.user.id },
    include: {
      laporan: {
        where: { deletedAt: null },
        include: {
          items: true,
          _count: { select: { aduan: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const laporan = mahasiswa?.laporan ?? [];

  const grouped = {
    DRAF:       laporan.filter((l) => l.status === "DRAF"),
    TERKIRIM:   laporan.filter((l) => l.status === "TERKIRIM"),
    DIVALIDASI: laporan.filter((l) => l.status === "DIVALIDASI"),
    DITOLAK:    laporan.filter((l) => l.status === "DITOLAK"),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Laporan Saya</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {laporan.length} laporan ditemukan
          </p>
        </div>
        <Link href="/dashboard/mahasiswa/laporan/baru" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Buat Laporan
        </Link>
      </div>

      {laporan.length === 0 ? (
        <div className="card text-center py-14">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-medium text-slate-600">Belum ada laporan</p>
          <p className="text-sm text-slate-400 mt-1">
            Mulai buat laporan penggunaan dana beasiswa Anda
          </p>
          <Link href="/dashboard/mahasiswa/laporan/baru" className="btn-primary btn-sm mt-4 inline-flex">
            Buat Laporan Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.DRAF.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
                Draf ({grouped.DRAF.length})
              </h2>
              <div className="space-y-2">
                {grouped.DRAF.map((lap) => (
                  <div
                    key={lap.id}
                    className="card flex items-center gap-4 py-4 hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{lap.semester}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {lap.items.length} item · Dibuat {formatDate(lap.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 flex-shrink-0">
                      {formatRupiah(lap.totalDana.toString())}
                    </p>
                    <span className={`badge flex-shrink-0 ${statusLaporanConfig.DRAF.color}`}>
                      Draf
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        href={`/dashboard/mahasiswa/laporan/${lap.id}`}
                        className="btn-secondary btn-sm"
                      >
                        Detail
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <HardDeleteButton laporanId={lap.id} semester={lap.semester} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {grouped.TERKIRIM.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
                Menunggu Validasi ({grouped.TERKIRIM.length})
              </h2>
              <div className="space-y-2">
                {grouped.TERKIRIM.map((lap) => (
                  <LaporanRow key={lap.id} lap={lap} />
                ))}
              </div>
            </section>
          )}

          {grouped.DITOLAK.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-3 px-1">
                Ditolak – Perlu Revisi ({grouped.DITOLAK.length})
              </h2>
              <div className="space-y-2">
                {grouped.DITOLAK.map((lap) => (
                  <LaporanRow key={lap.id} lap={lap} highlight="red" />
                ))}
              </div>
            </section>
          )}

          {grouped.DIVALIDASI.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-3 px-1">
                Tervalidasi ({grouped.DIVALIDASI.length})
              </h2>
              <div className="space-y-2">
                {grouped.DIVALIDASI.map((lap) => (
                  <LaporanRow key={lap.id} lap={lap} highlight="green" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────
function LaporanRow({
  lap,
  highlight,
}: {
  lap: any;
  highlight?: "red" | "green";
}) {
  const cfg = statusLaporanConfig[lap.status as keyof typeof statusLaporanConfig];
  const border =
    highlight === "red"
      ? "border-l-4 border-l-red-400"
      : highlight === "green"
      ? "border-l-4 border-l-green-400"
      : "";

  return (
    <Link
      href={`/dashboard/mahasiswa/laporan/${lap.id}`}
      className={`card flex items-center gap-4 py-4 hover:shadow-card-hover transition-shadow group ${border}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 group-hover:text-primary-700 transition-colors">
          {lap.semester}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {lap.items.length} item · {formatDate(lap.createdAt)}
          {lap._count?.aduan > 0 && (
            <span className="ml-2 text-red-500 font-medium">
              · {lap._count.aduan} aduan
            </span>
          )}
        </p>
      </div>
      <p className="text-sm font-semibold text-slate-700 flex-shrink-0">
        {formatRupiah(lap.totalDana.toString())}
      </p>
      <span className={`badge flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
    </Link>
  );
}
