// src/app/dashboard/mahasiswa/laporan/baru/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, ArrowLeft, Send, Save } from "lucide-react";
import Link from "next/link";

interface ItemLaporan {
  id: string;
  deskripsi: string;
  nominal: string;
  kategori: string;
}

const KATEGORI: { value: string; label: string }[] = [
  { value: "SPP", label: "SPP" },
  { value: "BUKU", label: "Buku" },
  { value: "KOS", label: "Kos" },
  { value: "MAKAN", label: "Makan" },
  { value: "TRANSPORTASI", label: "Transportasi" },
  { value: "PRAKTIKUM", label: "Praktikum" },
  { value: "ALAT_TULIS", label: "Alat Tulis" },
  { value: "BIAYA_HIDUP", label: "Biaya Hidup" },
  { value: "LAINNYA", label: "Lainnya" },
];

const SEMESTER_OPTIONS = ["GASAL", "GENAP"];
const TAHUN_AJARAN_OPTIONS = ["2023/2024", "2024/2025", "2025/2026", "2026/2027"];

export default function BuatLaporanPage() {
  const router = useRouter();
  const [semester, setSemester] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState<ItemLaporan[]>([
    { id: crypto.randomUUID(), deskripsi: "", nominal: "", kategori: "SPP" },  ]);
  const [loading, setLoading] = useState<"draf" | "kirim" | null>(null);
  const [error, setError] = useState("");

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), deskripsi: "", nominal: "", kategori: "LAINNYA" },
    ]);
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof ItemLaporan, value: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  }

  const totalDana = items.reduce(
    (sum, item) => sum + (parseFloat(item.nominal) || 0),
    0
  );

  function formatRupiahInput(value: string) {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat("id-ID").format(num);
  }

  async function handleSubmit(submitStatus: "DRAF" | "TERKIRIM") {
    if (!semester || !tahunAjaran) {
      setError("Pilih semester dan tahun ajaran terlebih dahulu.");
      return;
    }
    const invalidItems = items.filter(
      (i) => !i.deskripsi.trim() || !i.nominal || parseFloat(i.nominal) <= 0
    );
    if (invalidItems.length > 0) {
      setError("Lengkapi semua item laporan (deskripsi dan nominal wajib diisi).");
      return;
    }
    setError("");
    setLoading(submitStatus === "DRAF" ? "draf" : "kirim");

    const payload = {
      semester,
      tahunAjaran,
      catatan,
      status: submitStatus,
      items: items.map((i) => ({
        deskripsi: i.deskripsi,
        nominal: parseFloat(i.nominal),
        kategori: i.kategori,
      })),
    };

    const res = await fetch("/api/laporan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/dashboard/mahasiswa/laporan");
      router.refresh();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Validasi gagal. Periksa kembali isian Anda.");
    }
    setLoading(null);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/mahasiswa/laporan" className="btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Buat Laporan Baru</h1>
          <p className="text-sm text-slate-500">Isi rincian penggunaan dana beasiswa Anda</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-800">Informasi Laporan</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Semester <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="input"
              title="input-semester"
            >
              <option value="">-- Semester --</option>
              {SEMESTER_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === "GASAL" ? "Gasal" : "Genap"}</option>
              ))}
            </select>
            <select
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              className="input"
              title="input-tahun-ajaran"
            >
              <option value="">-- Tahun Ajaran --</option>
              {TAHUN_AJARAN_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Catatan (opsional)
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="input resize-none h-20"
            placeholder="Keterangan tambahan untuk laporan ini..."
          />
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Rincian Penggunaan Dana</h2>
          <button onClick={addItem} className="btn-secondary btn-sm">
            <PlusCircle className="w-4 h-4" />
            Tambah Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">Item #{idx + 1}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                  title="hapus-item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Deskripsi *</label>
                  <input
                    type="text"
                    value={item.deskripsi}
                    onChange={(e) => updateItem(item.id, "deskripsi", e.target.value)}
                    className="input text-sm"
                    placeholder="cth: Pembayaran SPP semester gasal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Kategori</label>
                  <select
                    value={item.kategori}
                    onChange={(e) => updateItem(item.id, "kategori", e.target.value)}
                    className="input text-sm"
                    title="input-kategori"
                  >
                    {KATEGORI.map((k) => (
                      <option key={k.value} value={k.value}>{k.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={item.nominal}
                    onChange={(e) => updateItem(item.id, "nominal", e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>


        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <span className="text-sm font-semibold text-slate-700">Total Dana</span>
          <span className="text-lg font-bold text-primary-700">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalDana)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleSubmit("DRAF")}
          disabled={!!loading}
          className="btn-secondary flex-1"
        >
          <Save className="w-4 h-4" />
          {loading === "draf" ? "Menyimpan..." : "Simpan Draf"}
        </button>
        <button
          onClick={() => handleSubmit("TERKIRIM")}
          disabled={!!loading}
          className="btn-primary flex-1"
        >
          <Send className="w-4 h-4" />
          {loading === "kirim" ? "Mengirim..." : "Kirim Laporan"}
        </button>
      </div>
    </div>
  );
}
