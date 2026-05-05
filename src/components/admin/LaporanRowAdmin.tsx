// src/components/admin/LaporanRowAdmin.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, X } from "lucide-react";

export default function LaporanRowAdmin({ lap }: { lap: any }) {
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalNum = Number(lap.totalDana);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fungsi untuk memanggil API
  async function handleAction(action: "validasi" | "tolak", catatan?: string) {
    if (action === "tolak" && !confirm("Yakin ingin menolak laporan ini?"))
      return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/laporan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          laporanId: lap.id,
          action: action,
          catatan: catatan,
        }),
      });

      if (res.ok) {
        setShowDetailModal(false);
        router.refresh(); // Refresh halaman agar status terbaru muncul
      } else {
        alert("Gagal memproses laporan");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td className="py-4 px-4">
          <p className="font-semibold text-slate-900">
            {lap.mahasiswa.user.name}
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {lap.mahasiswa.nim || "NIM Tidak ada"}
          </p>
        </td>
        <td className="py-4 px-4 text-sm text-slate-700">
          {lap.mahasiswa.beasiswa.nama}
        </td>
        <td className="py-4 px-4 text-sm text-slate-700">{lap.semester}</td>
        <td className="py-4 px-4 text-right font-semibold text-slate-900">
          {formatRupiah(lap.totalDana.toString())}
        </td>
        <td className="py-4 px-4">
          <button
            onClick={() => setShowDetailModal(true)}
            className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1 hover:underline"
          >
            <Eye className="w-4 h-4" />
            {lap.items.length} item
          </button>
        </td>
        <td className="py-4 px-4">
          <span
            className={`badge ${lap.status === "TERKIRIM" ? "bg-blue-100 text-blue-700" : lap.status === "DIVALIDASI" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {lap.status === "DIVALIDASI"
              ? "Divalidasi"
              : lap.status === "DITOLAK"
                ? "Ditolak"
                : "Terkirim"}
          </span>
        </td>
        <td className="py-4 px-4">
          {lap._count?.aduan > 0 ? (
            <span className="badge bg-red-100 text-red-600">
              {lap._count.aduan} aduan
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </td>
        <td className="py-4 px-4 flex items-center gap-2">
          {lap.status === "TERKIRIM" && (
            <>
              <button
                onClick={() => handleAction("validasi")}
                disabled={isLoading}
                title="Validasi Laporan"
                className="p-1.5 text-green-600 hover:bg-green-50 border border-green-200 rounded-md transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  handleAction("tolak", "Laporan ditolak oleh admin.")
                }
                disabled={isLoading}
                title="Tolak/Revisi Laporan"
                className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
        </td>
      </tr>

      {/* MODAL (Hanya muncul jika showDetailModal bernilai true) */}
      {showDetailModal && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Detail Laporan Mahasiswa
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {lap.mahasiswa.user.name} • {lap.semester}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">
                  Rincian Penggunaan Dana
                </h4>
                <p className="text-sm font-bold text-primary-700">
                  {formatRupiah(lap.totalDana.toString())}
                </p>
              </div>

              <div className="space-y-3">
                {lap.items.map((item: any, idx: number) => {
                  const pct =
                    totalNum > 0
                      ? ((Number(item.nominal) / totalNum) * 100).toFixed(1)
                      : "0";
                  return (
                    <div key={item.id} className="group">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-medium text-slate-400 tabular-nums w-4 flex-shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="text-slate-800 truncate font-medium">
                            {item.deskripsi}
                          </span>
                          <span className="badge bg-slate-100 text-slate-500 text-[10px] flex-shrink-0 uppercase">
                            {item.kategori}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-700 flex-shrink-0 ml-2">
                          {formatRupiah(item.nominal.toString())}
                        </span>
                      </div>
                      <div className="ml-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="ml-6 text-[10px] text-slate-400 mt-0.5">
                        {pct}% dari total
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100">
                <span className="text-sm font-bold text-slate-700">TOTAL</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatRupiah(lap.totalDana.toString())}
                </span>
              </div>
            </div>

            {lap.status === "TERKIRIM" && (
              <div className="p-5 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 rounded-b-2xl">
                <button
                  onClick={() =>
                    handleAction("tolak", "Laporan ditolak oleh admin.")
                  }
                  disabled={isLoading}
                  className="btn border border-red-200 text-red-600 bg-white px-4 py-2 text-sm rounded-lg flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Tolak & Revisi
                </button>
                <button
                  onClick={() => handleAction("validasi")}
                  disabled={isLoading}
                  className="btn bg-green-600 text-white px-4 py-2 text-sm rounded-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Validasi
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
