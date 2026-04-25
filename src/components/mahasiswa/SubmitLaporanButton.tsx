// src/components/mahasiswa/SubmitLaporanButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle } from "lucide-react";

interface Props {
  laporanId: string;
}

export default function SubmitLaporanButton({ laporanId }: Props) {
  const router  = useRouter();
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/laporan/${laporanId}/submit`, {
      method: "PATCH",
    });
    if (res.ok) {
      setShow(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Gagal mengirim laporan.");
    }
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setShow(true)} className="btn-primary">
        <Send className="w-4 h-4" />
        Kirim ke Admin
      </button>

      {show && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShow(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Kirim Laporan?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Setelah dikirim, laporan tidak dapat diedit dan akan menunggu
                  validasi dari admin.
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShow(false)} className="btn-secondary btn-sm">
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary btn-sm"
              >
                {loading ? "Mengirim..." : "Ya, Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
