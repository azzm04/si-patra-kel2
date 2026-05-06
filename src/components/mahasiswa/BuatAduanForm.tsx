// src/components/mahasiswa/BuatAduanForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, AlertTriangle, EyeOff, Eye } from "lucide-react";

interface LaporanOption {
  id:    string;
  label: string;
}

interface Props {
  laporanOptions: LaporanOption[];
}

export default function BuatAduanForm({ laporanOptions }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    judul:     "",
    deskripsi: "",
    buktiUrl:  "",
    laporanId: "",  // laporan yang diadukan (opsional)
    isAnonim:  false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.judul.trim()) {
      setError("Judul wajib diisi.");
      return;
    }
    if (form.deskripsi.trim().length < 20) {
      setError("Deskripsi minimal 20 karakter.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/aduan", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        judul:     form.judul,
        deskripsi: form.deskripsi,
        buktiUrl:  form.buktiUrl,
        laporanId: form.laporanId || undefined,
        isAnonim:  form.isAnonim,
      }),
    });

    if (res.ok) {
      router.push("/dashboard/mahasiswa/aduan");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Terjadi kesalahan. Coba lagi.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/mahasiswa/aduan" className="btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kirim Aduan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Laporkan indikasi penyalahgunaan dana beasiswa
          </p>
        </div>
      </div>

      <div className="card bg-amber-50 border-amber-200 p-4">
        <div className="flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Identitas Anda akan dijaga kerahasiaannya. Harap memberikan informasi
            yang akurat dan disertai bukti.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {form.isAnonim
              ? <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              : <Eye    className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            }
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {form.isAnonim ? "Identitas Disembunyikan" : "Tampilkan Identitas Saya"}
              </p>
              <p className="text-xs text-slate-400">
                {form.isAnonim
                  ? "Aduan akan tercatat sebagai Anonim di sistem admin"
                  : "Nama Anda akan terlihat oleh admin (tetap rahasia dari teradu)"}
              </p>
            </div>
          </div>

          <button
            type="button"
            title="tutup"
            onClick={() => setForm((p) => ({ ...p, isAnonim: !p.isAnonim }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              form.isAnonim ? "bg-slate-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow transition-transform duration-200 ${
                form.isAnonim ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Laporan yang Diadukan
            <span className="text-slate-400 font-normal ml-1">(opsional)</span>
          </label>
          <select
            name="laporanId"
            value={form.laporanId}
            onChange={handleChange}
            className="input"
            title="inputan"
          >
            <option value="">-- Tidak merujuk laporan tertentu --</option>
            {laporanOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Pilih jika aduan Anda berkaitan dengan laporan penggunaan dana tertentu
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Judul Aduan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="judul"
            value={form.judul}
            onChange={handleChange}
            className="input"
            placeholder="cth: Indikasi penggunaan dana tidak sesuai peruntukannya"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Deskripsi Aduan <span className="text-red-500">*</span>
          </label>
          <textarea
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            className="input resize-none h-36"
            placeholder="Jelaskan secara detail indikasi penyalahgunaan yang Anda ketahui, termasuk waktu, tempat, dan pihak yang terlibat..."
          />
          <p className={`text-xs mt-1 ${form.deskripsi.length < 20 ? "text-slate-400" : "text-green-600"}`}>
            {form.deskripsi.length}/20 karakter minimum
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            URL Bukti <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <input
            type="url"
            name="buktiUrl"
            value={form.buktiUrl}
            onChange={handleChange}
            className="input"
            placeholder="https://drive.google.com/... atau link foto/dokumen bukti"
          />
          <p className="text-xs text-slate-400 mt-1">
            Upload bukti ke Google Drive / cloud storage lalu tempelkan link-nya di sini
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          Aduan ini akan tercatat sebagai:{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {form.isAnonim ? "Anonim" : "Atas nama Anda (hanya terlihat admin)"}
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/mahasiswa/aduan" className="btn-secondary flex-1 justify-center">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            <Send className="w-4 h-4" />
            {loading ? "Mengirim..." : "Kirim Aduan"}
          </button>
        </div>
      </form>
    </div>
  );
}
