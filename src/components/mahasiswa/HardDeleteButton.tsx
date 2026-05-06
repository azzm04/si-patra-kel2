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

  async function handleSoftDelete() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/laporan?id=${laporanId}`, {
      method: "DELETE",
    });

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
        title="Pindahkan ke sampah"
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
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Hapus Laporan?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Laporan <span className="font-medium text-slate-700 dark:text-slate-300">"{semester}"</span> akan
                  dipindahkan ke <strong>Sampah</strong>.
                </p>
              </div>
            </div>

            {/* Info soft delete */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Laporan <strong>tidak langsung terhapus permanen</strong>. Anda masih bisa
                  memulihkannya dari halaman <strong>Sampah</strong>, atau menghapus
                  permanen dari sana.
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="btn-secondary btn-sm">
                Batal
              </button>
              <button
                onClick={handleSoftDelete}
                disabled={loading}
                className="btn btn-sm bg-amber-500 text-white hover:bg-amber-600 px-3 py-1.5 text-xs"
              >
                {loading ? "Memindahkan..." : "Pindah ke Sampah"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}