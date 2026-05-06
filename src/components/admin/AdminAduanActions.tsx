// src/components/admin/AdminAduanActions.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, Loader, ChevronDown } from "lucide-react";

interface Props {
  aduanId:       string;
  currentStatus: string;
}

type TargetStatus = "DIPROSES" | "SELESAI" | "DITOLAK";

const actionMap: Record<string, { label: string; target: TargetStatus; color: string }[]> = {
  MENUNGGU: [
    { label: "Proses",  target: "DIPROSES", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
    { label: "Tolak",   target: "DITOLAK",  color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
  ],
  DIPROSES: [
    { label: "Selesai", target: "SELESAI",  color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
    { label: "Tolak",   target: "DITOLAK",  color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
  ],
};

export default function AdminAduanActions({ aduanId, currentStatus }: Props) {
  const [loading,   setLoading]   = useState(false);
  const [catatan,   setCatatan]   = useState("");
  const [showModal, setShowModal] = useState<TargetStatus | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const actions = actionMap[currentStatus] ?? [];
  if (actions.length === 0) return <span className="text-xs text-slate-300">—</span>;

  async function handleSubmit() {
    if (!showModal) return;
    setLoading(true);
    await fetch("/api/admin/aduan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aduanId, status: showModal, catatan }),
    });
    setLoading(false);
    setShowModal(null);
    window.location.reload();
  }

  const modalLabels: Record<TargetStatus, { title: string; desc: string; btnClass: string; btnLabel: string }> = {
    DIPROSES: {
      title:    "Proses Aduan",
      desc:     "Aduan ini akan ditandai sedang diproses.",
      btnClass: "btn btn-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 text-xs",
      btnLabel: "Konfirmasi Proses",
    },
    SELESAI: {
      title:    "Tandai Selesai",
      desc:     "Aduan ini akan ditutup sebagai selesai ditindaklanjuti.",
      btnClass: "btn btn-sm bg-green-600 text-white hover:bg-green-700 px-3 py-1.5 text-xs",
      btnLabel: "Tandai Selesai",
    },
    DITOLAK: {
      title:    "Tolak Aduan",
      desc:     "Aduan ini akan ditolak. Berikan alasan agar pelapor memahami keputusan ini.",
      btnClass: "btn-danger btn-sm",
      btnLabel: "Tolak Aduan",
    },
  };

  return (
    <>
      <div className="flex gap-1 flex-shrink-0">
        {actions.map((a) => (
          <button
            key={a.target}
            onClick={() => setShowModal(a.target)}
            className={`btn btn-sm border text-xs px-2.5 py-1 ${a.color}`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {showModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {modalLabels[showModal].title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{modalLabels[showModal].desc}</p>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan untuk pelapor (opsional)"
              className="input text-sm resize-none h-24 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(null)} className="btn-secondary btn-sm">
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={modalLabels[showModal].btnClass}
              >
                {loading ? "Memproses..." : modalLabels[showModal].btnLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
