// src/components/admin/AdminLaporanActions.tsx
"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown } from "lucide-react";

interface Props {
  laporanId: string;
  currentStatus: string;
}

export default function AdminLaporanActions({ laporanId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [showModal, setShowModal] = useState<"validasi" | "tolak" | null>(null);

  async function handleAction(action: "validasi" | "tolak") {
    setLoading(true);
    await fetch(`/api/admin/laporan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ laporanId, action, catatan }),
    });
    setLoading(false);
    setShowModal(null);
    window.location.reload();
  }

  if (currentStatus === "DIVALIDASI" || currentStatus === "DRAF") {
    return <span className="text-xs text-slate-300">—</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {currentStatus === "TERKIRIM" && (
            <button
              onClick={() => setShowModal("validasi")}
              className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              title="Validasi"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
        {currentStatus === "TERKIRIM" && (
            <button
              onClick={() => setShowModal("tolak")}
              className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              title="Tolak"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )
        }
        {currentStatus === "DITOLAK" && (
          <button
            onClick={() => setShowModal("validasi")}
            className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
            title="Validasi ulang"
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<<<<<<< HEAD
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-slate-900 mb-1">
              {showModal === "validasi" ? "Validasi Laporan" : "Tolak Laporan"}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
=======
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {showModal === "validasi" ? "Validasi Laporan" : "Tolak Laporan"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
              {showModal === "validasi"
                ? "Laporan ini akan ditandai sebagai tervalidasi."
                : "Laporan ini akan ditolak dan mahasiswa perlu merevisi."}
            </p>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan untuk mahasiswa (opsional)"
              className="input text-sm resize-none h-20 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(null)}
                className="btn-secondary btn-sm"
                title="batal"
              >
                Batal
              </button>
              <button
                onClick={() => handleAction(showModal)}
                disabled={loading}
                className={showModal === "validasi" ? "btn-primary btn-sm" : "btn-danger btn-sm"}
                title={showModal === "validasi" ? "validasi" : "tolak"}
              >
                {loading ? "Memproses..." : showModal === "validasi" ? "Validasi" : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
