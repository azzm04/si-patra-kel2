// src/app/dashboard/mahasiswa/sampah/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { Trash2, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import TrashActions from "@/components/mahasiswa/TrashActions";
import Link from "next/link";

export default async function SampahPage() {
  const session = await auth();

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session!.user.id },
  });

  const laporan = mahasiswa
    ? await prisma.laporanPenggunaan.findMany({
        where: {
          mahasiswaId: mahasiswa.id,
          deletedAt:   { not: null },
        },
        include: { items: true },
        orderBy: { deletedAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Link
          href={`/dashboard/mahasiswa/laporan`}
          className="btn-secondary btn-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
          <Trash2 className="w-5 h-5 text-slate-500" />
          Sampah
        </h1>
        <p className="text-sm text-slate-700 mt-0.5">
          {laporan.length} laporan di sampah
        </p>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Laporan di sini belum terhapus permanen</p>
          <p className="mt-0.5 text-amber-700">
            Anda dapat <strong>memulihkan</strong> laporan kembali ke Draf,
            atau <strong>menghapus permanen</strong> untuk benar-benar
            menghapus data dari database.
          </p>
        </div>
      </div>

      {/* List */}
      {laporan.length === 0 ? (
        <div className="card text-center py-14">
          <Trash2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-medium text-slate-600">Sampah kosong</p>
          <p className="text-sm text-slate-400 mt-1">
            Laporan yang dihapus akan muncul di sini
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {laporan.map((lap, idx) => (
            <div
              key={lap.id}
              className="card border-dashed border-slate-300 opacity-80 hover:opacity-100 transition-opacity animate-fade-in-up"
              style={{ animationDelay: `${200 + idx * 50}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info laporan */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-700">
                      {lap.semester} {(lap as any).tahunAjaran ?? ""}
                    </p>
                    <span className="badge bg-red-100 text-red-600 text-[10px]">
                      Dihapus
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {formatRupiah(lap.totalDana.toString())}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lap.items.length} item · Dihapus{" "}
                    {lap.deletedAt ? formatDateTime(lap.deletedAt) : "-"}
                  </p>

                  {/* Preview items */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {lap.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600"
                      >
                        {item.deskripsi}
                        <span className="text-slate-400">
                          · {formatRupiah(item.nominal.toString())}
                        </span>
                      </span>
                    ))}
                    {lap.items.length > 3 && (
                      <span className="text-xs text-slate-400 px-2 py-0.5">
                        +{lap.items.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <TrashActions
                  laporanId={lap.id}
                  semester={`${lap.semester} ${(lap as any).tahunAjaran ?? ""}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}