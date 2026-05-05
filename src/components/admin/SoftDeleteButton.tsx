// src/components/admin/SoftDeleteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserX, UserCheck, AlertTriangle } from "lucide-react";

interface Props {
  userId:   string;
  isActive: boolean;
  userName: string;
}

export default function SoftDeleteButton({ userId, isActive, userName }: Props) {
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  // Perlu mounted agar createPortal hanya berjalan di client-side
  useEffect(() => { setMounted(true); }, []);

  async function handleAction() {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        action: isActive ? "deactivate" : "activate",
      }),
    });
    setLoading(false);
    setShowModal(false);
    window.location.reload();
  }

  // Modal di-render via Portal langsung ke document.body
  // agar tidak terclip oleh overflow:hidden di dalam tabel
  const modal = showModal && mounted && createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-red-100" : "bg-green-100"}`}>
            <AlertTriangle className={`w-5 h-5 ${isActive ? "text-red-600" : "text-green-600"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              {isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {isActive
                ? `Akun ${userName} akan dinonaktifkan (soft delete). Mahasiswa tidak bisa login, namun data tetap tersimpan.`
                : `Akun ${userName} akan diaktifkan kembali dan dapat login kembali.`}
            </p>
          </div>
        </div>

        {isActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700">
              Pastikan ada alasan yang valid sebelum menonaktifkan akun penerima beasiswa.
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="btn-secondary btn-sm"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleAction}
            disabled={loading}
            className={
              isActive
                ? "btn-danger btn-sm"
                : "btn btn-sm bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 px-3 py-1.5 text-xs"
            }
          >
            {loading
              ? "Memproses..."
              : isActive
              ? "Ya, Nonaktifkan"
              : "Ya, Aktifkan"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title={isActive ? "Nonaktifkan akun" : "Aktifkan kembali"}
        className={
          isActive
            ? "btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            : "btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
        }
      >
        {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
      </button>

      {modal}
    </>
  );
}
