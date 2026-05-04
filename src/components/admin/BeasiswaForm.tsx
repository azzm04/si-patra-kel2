// src/components/admin/BeasiswaForm.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PlusCircle, Pencil, X } from "lucide-react";

type Mode = "create" | "edit";

interface BeasiswaData {
  id:                 string;
  nama:               string;
  penyelenggara:      string;
  kuota:              number;
  nominalPerSemester: string;
  deskripsi:          string;
  status:             "AKTIF" | "NONAKTIF";
}

interface Props {
  mode:      Mode;
  beasiswa?: BeasiswaData;
}

const defaultForm = {
  nama:               "",
  penyelenggara:      "",
  kuota:              "",
  nominalPerSemester: "",
  deskripsi:          "",
  status:             "AKTIF" as const,
};

export default function BeasiswaForm({ mode, beasiswa }: Props) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState(
    mode === "edit" && beasiswa
      ? {
          nama:               beasiswa.nama,
          penyelenggara:      beasiswa.penyelenggara,
          kuota:              String(beasiswa.kuota),
          nominalPerSemester: beasiswa.nominalPerSemester,
          deskripsi:          beasiswa.deskripsi,
          status:             beasiswa.status,
        }
      : defaultForm
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama || !form.penyelenggara || !form.kuota || !form.nominalPerSemester) {
      setError("Semua field wajib diisi kecuali deskripsi.");
      return;
    }
    setError("");
    setLoading(true);

    const payload = {
      nama:               form.nama,
      penyelenggara:      form.penyelenggara,
      kuota:              parseInt(form.kuota),
      nominalPerSemester: parseFloat(form.nominalPerSemester),
      deskripsi:          form.deskripsi,
      status:             form.status,
    };

    const res = await fetch(
      mode === "edit" ? `/api/admin/beasiswa?id=${beasiswa?.id}` : "/api/admin/beasiswa",
      {
        method:  mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      }
    );

    if (res.ok) {
      setOpen(false);
      window.location.reload();
    } else {
      const data = await res.json();
      setError(data.error ?? "Terjadi kesalahan.");
    }
    setLoading(false);
  }

  return (
    <>
      {mode === "create" ? (
        <button onClick={() => setOpen(true)} className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Tambah Beasiswa
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="btn btn-sm bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
          title="edit-beasiswa"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {open && mounted && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                {mode === "create" ? "Tambah Program Beasiswa" : "Edit Program Beasiswa"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="tombol"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Program <span className="text-red-500">*</span>
                </label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  className="input"
                  placeholder="cth: KIP-Kuliah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Penyelenggara <span className="text-red-500">*</span>
                </label>
                <input
                  name="penyelenggara"
                  value={form.penyelenggara}
                  onChange={handleChange}
                  className="input"
                  placeholder="cth: Kemdikbudristek"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Kuota <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="kuota"
                    type="number"
                    min="1"
                    value={form.kuota}
                    onChange={handleChange}
                    className="input"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Dana/Semester (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nominalPerSemester"
                    type="number"
                    min="0"
                    value={form.nominalPerSemester}
                    onChange={handleChange}
                    className="input font-mono"
                    placeholder="4200000"
                  />
                </div>
              </div>

              {mode === "edit" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="input"
                    title="input-status"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  className="input resize-none h-20"
                  placeholder="Deskripsi singkat program beasiswa..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading
                    ? "Menyimpan..."
                    : mode === "create"
                    ? "Tambah Beasiswa"
                    : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
