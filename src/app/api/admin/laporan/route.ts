// src/app/api/admin/laporan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  laporanId: z.string(),
  action:    z.enum(["validasi", "tolak"]),
  catatan:   z.string().optional(),
});

// PATCH: Validasi atau tolak laporan
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const { laporanId, action, catatan } = parsed.data;

  const laporan = await prisma.laporanPenggunaan.findUnique({
    where: { id: laporanId },
  });

  if (!laporan || laporan.deletedAt) {
    return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
  }

  const newStatus = action === "validasi" ? "DIVALIDASI" : "DITOLAK";

  const updated = await prisma.laporanPenggunaan.update({
    where: { id: laporanId },
    data: {
      status:       newStatus,
      catatanAdmin: catatan || null,
    },
  });

  return NextResponse.json(updated);
}

// GET: Detail satu laporan (dengan JOIN lengkap)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

  const laporan = await prisma.laporanPenggunaan.findUnique({
    where: { id },
    include: {
      mahasiswa: {
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } },
          beasiswa: true,
        },
      },
      items: true,
      aduan: {
        include: { pelapor: { select: { name: true } } },
      },
    },
  });

  if (!laporan) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  return NextResponse.json(laporan);
}
