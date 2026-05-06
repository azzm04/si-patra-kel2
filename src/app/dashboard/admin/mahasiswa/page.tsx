// src/app/dashboard/admin/mahasiswa/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import SoftDeleteButton from "@/components/admin/SoftDeleteButton";
import MahasiswaFilterBar from "@/components/admin/MahasiswaFilterBar";
import { Users, UserCheck, UserMinus, SearchX } from "lucide-react";

interface SearchParams {
  search?: string;
  status?: string;
}

export default async function AdminMahasiswaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search, status } = searchParams;

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const [totalAktif, totalNonaktif] = await Promise.all([
    prisma.user.count({
      where: { role: { not: "ADMIN" }, isActive: true, deletedAt: null },
    }),
    prisma.user.count({
      where: { role: { not: "ADMIN" }, isActive: false, deletedAt: null },
    }),
  ]);
  const totalMahasiswa = totalAktif + totalNonaktif;
  const users = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" },
      deletedAt: null,
      ...(status === "aktif" ? { isActive: true } : {}),
      ...(status === "nonaktif" ? { isActive: false } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { mahasiswa: { nim: { contains: search, mode: "insensitive" } } },
              {
                mahasiswa: { prodi: { contains: search, mode: "insensitive" } },
              },
            ],
          }
        : {}),
    },
    include: {
      mahasiswa: {
        include: {
          beasiswa: { select: { nama: true } },
          _count: { select: { laporan: { where: { deletedAt: null } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Manajemen Mahasiswa
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {totalAktif} aktif · {totalNonaktif} nonaktif
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Mahasiswa",
            value: totalMahasiswa,
            icon: Users,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Mahasiswa Aktif",
            value: totalAktif,
            icon: UserCheck,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Mahasiswa Nonaktif",
            value: totalNonaktif,
            icon: UserMinus,
            color: "bg-red-50 text-red-600",
          },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.label} 
              className="card animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover cursor-default group"
              style={{ animationDelay: `${100 + idx * 75}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:text-slate-400 transition-colors">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
        <MahasiswaFilterBar />
      </div>

      <div className="card p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80">
                <th className="text-left font-semibold text-slate-600 dark:text-slate-400 px-5 py-3.5 text-xs uppercase tracking-wider rounded-tl-xl">
                  Mahasiswa
                </th>
                <th className="text-left font-semibold text-slate-600 dark:text-slate-400 px-5 py-3.5 text-xs uppercase tracking-wider">
                  NIM / Prodi
                </th>
                <th className="text-left font-semibold text-slate-600 dark:text-slate-400 px-5 py-3.5 text-xs uppercase tracking-wider">
                  Beasiswa
                </th>
                <th className="text-center font-semibold text-slate-600 dark:text-slate-400 px-5 py-3.5 text-xs uppercase tracking-wider">
                  Laporan
                </th>
                <th className="text-left font-semibold text-slate-600 dark:text-slate-400 px-5 py-3.5 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left font-semibold text-slate-600 dark:text-slate-400 px-5 py-3.5 text-xs uppercase tracking-wider">
                  Terdaftar
                </th>
                <th className="px-5 py-3.5 rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/50 rounded-full flex items-center justify-center">
                        <SearchX className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-slate-100 font-medium text-lg">Tidak ada mahasiswa ditemukan</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`relative hover:bg-slate-50/80 transition-all duration-300 group ${!user.isActive ? "opacity-60 bg-slate-50/50 grayscale-[50%]" : ""}`}
                  >
                    <td className="px-5 py-4 relative">
                      {/* Premium Hover Indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-y-50 group-hover:scale-y-100 origin-center ease-out"></div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ring-2 ring-white ${user.isActive ? "bg-primary-100 text-primary-700 shadow-sm" : "bg-slate-200 text-slate-500 dark:text-slate-400"}`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-700 transition-colors">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-slate-100 transition-colors">
                        {user.mahasiswa?.nim ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {user.mahasiswa?.prodi ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-inset ring-indigo-700/10 group-hover:bg-indigo-100 transition-colors shadow-sm">
                        {user.mahasiswa?.beasiswa.nama ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 text-sm shadow-sm ring-1 ring-slate-200 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:ring-primary-200 group-hover:shadow transition-all duration-300 transform group-hover:-translate-y-0.5">
                        {user.mahasiswa?._count.laporan ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.isActive ? (
                        <span className="badge bg-green-100 text-green-700 border border-green-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700 border border-red-200">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <SoftDeleteButton
                        userId={user.id}
                        isActive={user.isActive}
                        userName={user.name}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
