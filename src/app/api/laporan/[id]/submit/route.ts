// src/app/api/laporan/[id]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session.user.id },
  });
  if (!mahasiswa) {
    return NextResponse.json({ error: "Data mahasiswa tidak ditemukan" }, { status: 404 });
  }

  const laporan = await prisma.laporanPenggunaan.findFirst({
    where: { id: params.id, mahasiswaId: mahasiswa.id, deletedAt: null },
  });

  if (!laporan) {
    return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
  }

  if (laporan.status !== "DRAF") {
    return NextResponse.json(
      { error: "Hanya laporan berstatus Draf yang dapat dikirim" },
      { status: 400 }
    );
  }

  const updated = await prisma.laporanPenggunaan.update({
    where: { id: params.id },
    data:  { status: "TERKIRIM" },
  });

  return NextResponse.json(updated);
}
