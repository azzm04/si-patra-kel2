// src/app/dashboard/admin/beasiswa/page.tsx
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/utils";
import { BookOpen, Users, FileText } from "lucide-react";
import BeasiswaForm from "@/components/admin/BeasiswaForm";

export default async function AdminBeasiswaPage() {
  // JOIN: Beasiswa + hitung mahasiswa + hitung laporan
  const beasiswa = await prisma.beasiswa.findMany({
    include: {
      _count: {
        select: {
          mahasiswa: true,
        },
      },
      mahasiswa: {
        select: {
          laporan: {
            where: { deletedAt: null },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Hitung total laporan per beasiswa
  const beasiswaWithStats = beasiswa.map((b) => ({
    ...b,
    totalLaporan: b.mahasiswa.reduce((sum, m) => sum + m.laporan.length, 0),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Beasiswa</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {beasiswa.length} program beasiswa terdaftar
          </p>
        </div>
        <BeasiswaForm mode="create" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {beasiswaWithStats.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 card text-center py-12">
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Belum ada data beasiswa</p>
          </div>
        ) : (
          beasiswaWithStats.map((b, idx) => (
            <div 
              key={b.id} 
              className="card space-y-4 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 animate-fade-in-up group"
              style={{ animationDelay: `${100 + idx * 75}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{b.nama}</h3>
                    <span
                      className={`badge text-[10px] ${
                        b.status === "AKTIF"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{b.penyelenggara}</p>
                </div>
                <BeasiswaForm
                  mode="edit"
                  beasiswa={{
                    id:                  b.id,
                    nama:                b.nama,
                    penyelenggara:       b.penyelenggara,
                    kuota:               b.kuota,
                    nominalPerSemester:  b.nominalPerSemester.toString(),
                    deskripsi:           b.deskripsi ?? "",
                    status:              b.status,
                  }}
                />
              </div>

              <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
                <p className="text-xs text-primary-500 font-medium">Dana per Semester</p>
                <p className="text-xl font-bold text-primary-700 mt-0.5">
                  {formatRupiah(b.nominalPerSemester.toString())}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Kuota",     value: b.kuota,                    icon: BookOpen },
                  { label: "Penerima",  value: b._count.mahasiswa,         icon: Users },
                  { label: "Laporan",   value: b.totalLaporan,             icon: FileText },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 transition-colors group-hover:bg-white group-hover:border-slate-200"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-800">{s.value}</p>
                      <p className="text-[10px] text-slate-400">{s.label}</p>
                    </div>
                  );
                })}
              </div>


              {b.deskripsi && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {b.deskripsi}
                </p>
              )}

              <p className="text-[10px] text-slate-400">
                Ditambahkan {formatDate(b.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
