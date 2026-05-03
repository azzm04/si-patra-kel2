// src/app/dashboard/admin/mahasiswa/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import SoftDeleteButton from "@/components/admin/SoftDeleteButton";
import MahasiswaFilterBar from "@/components/admin/MahasiswaFilterBar";

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
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Manajemen Mahasiswa
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {totalAktif} aktif · {totalNonaktif} nonaktif
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total",
            value: totalMahasiswa,
            color: "bg-slate-100 text-slate-700",
          },
          {
            label: "Aktif",
            value: totalAktif,
            color: "bg-green-100 text-green-700",
          },
          {
            label: "Nonaktif",
            value: totalNonaktif,
            color: "bg-red-100 text-red-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`card py-3 text-center ${s.color} border-0`}
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <MahasiswaFilterBar />

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left font-medium text-slate-500 px-4 py-3">
                  Mahasiswa
                </th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">
                  NIM / Prodi
                </th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">
                  Beasiswa
                </th>
                <th className="text-center font-medium text-slate-500 px-4 py-3">
                  Laporan
                </th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">
                  Status
                </th>
                <th className="text-left font-medium text-slate-500 px-4 py-3">
                  Terdaftar
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-12">
                    Tidak ada mahasiswa ditemukan
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50 transition-colors ${!user.isActive ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-slate-700">
                        {user.mahasiswa?.nim ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {user.mahasiswa?.prodi ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-sm">
                      {user.mahasiswa?.beasiswa.nama ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium text-slate-700">
                        {user.mahasiswa?._count.laporan ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="badge bg-green-100 text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
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
