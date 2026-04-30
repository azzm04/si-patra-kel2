// src/components/mahasiswa/TrashActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, AlertTriangle } from "lucide-react";

interface Props {
  laporanId: string;
  semester:  string;
}

export default function TrashActions({ laporanId, semester }: Props) {
  const router = useRouter();
  const [showHardDelete, setShowHardDelete] = useState(false);
  const [loading,        setLoading]        = useState<"restore" | "delete" | null>(null);
  const [error,          setError]          = useState("");

  // Restore → kembali ke Draf
  async function handleRestore() {
    setLoading("restore");
    setError("");
    const res = await fetch("/api/laporan/trash", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ laporanId }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Gagal memulihkan laporan.");
    }
    setLoading(null);
  }

  // Hard delete → hapus permanen
  async function handleHardDelete() {
    setLoading("delete");
    setError("");
    const res = await fetch(`/api/laporan/trash?id=${laporanId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setShowHardDelete(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Gagal menghapus laporan.");
    }
    setLoading(null);
  }

  return (
    <>
      <div className="flex flex-col gap-2 flex-shrink-0">
        {/* Restore */}
        <button
          onClick={handleRestore}
          disabled={!!loading}
          className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading === "restore" ? "animate-spin" : ""}`} />
          {loading === "restore" ? "Memulihkan..." : "Pulihkan"}
        </button>

        {/* Hard delete */}
        <button
          onClick={() => setShowHardDelete(true)}
          disabled={!!loading}
          className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 whitespace-nowrap"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus Permanen
        </button>
      </div>

      {/* Konfirmasi hard delete */}
      {showHardDelete && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHardDelete(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Hapus Permanen?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Laporan <span className="font-medium text-slate-700">"{semester}"</span> akan
                  dihapus <strong>permanen dari database</strong>.
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  <strong>Tindakan ini tidak bisa dibatalkan.</strong> Seluruh data laporan
                  beserta rincian item akan dihapus permanen dari database.
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowHardDelete(false)}
                className="btn-secondary btn-sm"
              >
                Batal
              </button>
              <button
                onClick={handleHardDelete}
                disabled={loading === "delete"}
                className="btn-danger btn-sm"
              >
                {loading === "delete" ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}