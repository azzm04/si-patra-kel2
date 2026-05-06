// src/app/api/laporan/trash/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: Restore laporan dari sampah (Kembalikan deletedAt menjadi null)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { laporanId } = await req.json();
  if (!laporanId) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session.user.id },
  });

  const laporan = await prisma.laporanPenggunaan.findFirst({
    where: {
      id:          laporanId,
      mahasiswaId: mahasiswa?.id,
      deletedAt:   { not: null }, // Pastikan memang sedang di sampah
    },
  });

  if (!laporan) {
    return NextResponse.json({ error: "Laporan tidak ditemukan di sampah" }, { status: 404 });
  }

  // Restore: hapus deletedAt
  await prisma.laporanPenggunaan.update({
    where: { id: laporanId },
    data:  { deletedAt: null }, // Status tidak diubah, mengikuti status terakhir sebelum dihapus
  });

  return NextResponse.json({ message: "Laporan berhasil dipulihkan" });
}

// DELETE: Hard delete permanen dari Database
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const laporanId = searchParams.get("id");
  if (!laporanId) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session.user.id },
  });

  const laporan = await prisma.laporanPenggunaan.findFirst({
    where: {
      id:          laporanId,
      mahasiswaId: mahasiswa?.id,
      deletedAt:   { not: null }, // Pastikan memang sedang di sampah
    },
  });

  if (!laporan) {
    return NextResponse.json(
      { error: "Laporan tidak ada di sampah atau tidak ditemukan" },
      { status: 404 }
    );
  }

  // HARD DELETE — hapus permanen
  // Karena di Prisma schema biasanya items memiliki relasi OnDelete: Cascade, 
  // menghapus parent akan menghapus items-nya juga.
  await prisma.laporanPenggunaan.delete({ where: { id: laporanId } });

  return NextResponse.json({ message: "Laporan dihapus permanen dari database" });
}