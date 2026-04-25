// src/components/mahasiswa/HardDeleteButton.tsx
"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  laporanId: string;
  semester:  string;
}

export default function HardDeleteButton({ laporanId, semester }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/laporan?id=${laporanId}`, { method: "DELETE" });

    if (res.ok) {
      setShowModal(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Gagal menghapus laporan.");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
        title="Hapus draf"
        className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
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
                <h3 className="font-semibold text-slate-900">Hapus Draf Laporan</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Hapus draf{" "}
                  <span className="font-medium text-slate-700">"{semester}"</span>?
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  <strong>Tindakan ini tidak dapat dibatalkan.</strong> Draf dan semua
                  item di dalamnya akan dihapus permanen (hard delete).
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary btn-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="btn-danger btn-sm"
              >
                {loading ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
