// src/components/mahasiswa/SoftDeleteButton.tsx
"use client";

import { useRouter, usePathname } from "next/navigation"; 
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

export default function SoftDeleteButton({ laporanId, semester }: { laporanId: string, semester: string }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    
    const res = await fetch(`/api/laporan?id=${laporanId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setShowModal(false);
      // Jika di halaman detail, tendang ke daftar laporan
      if (pathname.includes(laporanId)) {
        router.push("/dashboard/mahasiswa/laporan");
        router.refresh();
      } else {
        router.refresh();
      }
    } else {
      setError("Gagal memindahkan laporan ke sampah. Coba lagi.");
    }
    setLoading(false);
  }

  return (
    <>
      {/* Tombol Trigger (Ikon Sampah) */}
      <button
        onClick={(e) => {
          e.preventDefault(); // Mencegah pindah halaman jika tombol ada di dalam Link
          setShowModal(true);
        }}
        className="btn-secondary btn-sm p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center"
        title="Pindah ke Sampah"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.preventDefault();
            if (!loading) setShowModal(false);
          }}
        >
          {/* Kotak Modal */}
          <div
<<<<<<< HEAD
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200"
=======
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200"
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
<<<<<<< HEAD
                <h3 className="text-lg font-semibold text-slate-900">Hapus Laporan?</h3>
                <p className="text-sm text-slate-500 mt-1">
=======
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Hapus Laporan?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
                  Laporan <strong>"{semester}"</strong> akan dipindahkan ke <strong>Sampah</strong>.
                </p>
              </div>
            </div>

            {/* Kotak Peringatan (Biru) */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-blue-700 leading-relaxed">
                  Laporan <strong>tidak langsung terhapus permanen</strong>. Anda masih bisa memulihkannya dari halaman <strong>Sampah</strong>, atau menghapus permanen dari sana.
                </p>
              </div>
            </div>

            {/* Tampilkan Error jika API gagal */}
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            {/* Tombol Aksi */}
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
<<<<<<< HEAD
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
=======
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:bg-slate-950/50 disabled:opacity-50 transition-colors"
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memindahkan...
                  </>
                ) : (
                  "Pindah ke Sampah"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}