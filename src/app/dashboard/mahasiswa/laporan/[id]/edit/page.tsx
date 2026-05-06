// src/app/dashboard/mahasiswa/laporan/[id]/edit/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditLaporanForm from "@/components/mahasiswa/EditLaporanForm";

export default async function EditLaporanPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session!.user.id },
  });
  if (!mahasiswa) redirect("/dashboard/mahasiswa");

  const laporan = await prisma.laporanPenggunaan.findFirst({
    where: { id: params.id, mahasiswaId: mahasiswa.id, deletedAt: null },
    include: {
      items: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!laporan) notFound();

  if (laporan.status === "DIVALIDASI") {
    redirect(`/dashboard/mahasiswa/laporan/${laporan.id}`);
  }

  // --- UBAH BAGIAN INI ---
  // Konversi objek Prisma (Decimal/Date) menjadi JSON murni
  const serializedLaporan = JSON.parse(JSON.stringify(laporan));

  return (
    // Lempar data yang sudah diserialisasi
    <div className="animate-fade-in-up" style={{ animationFillMode: "both" }}>
      <EditLaporanForm initialData={serializedLaporan} />
    </div>
  );
}