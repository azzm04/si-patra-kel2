// src/app/api/laporan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Semester } from "@prisma/client";

const itemSchema = z.object({
  deskripsi: z.string().min(1),
  nominal:   z.number().positive(),
  kategori:  z.string().min(1),
});

const laporanSchema = z.object({
  semester:    z.nativeEnum(Semester),
  tahunAjaran: z.string().regex(/^\d{4}\/\d{4}$/, "Format tahun ajaran: 2024/2025"),
  catatan:     z.string().optional(),
  status:      z.enum(["DRAF", "TERKIRIM"]),
  items:       z.array(itemSchema).min(1),
});

// POST: Buat laporan baru
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = laporanSchema.safeParse(body);
  if (!parsed.success) {
    const messages = Object.values(parsed.error.flatten().fieldErrors).flat();
    return NextResponse.json({ error: messages[0] ?? "Validasi gagal" }, { status: 400 });
  }

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session.user.id },
  });
  if (!mahasiswa) {
    return NextResponse.json({ error: "Data mahasiswa tidak ditemukan" }, { status: 404 });
  }

  const { semester, tahunAjaran, catatan, status, items } = parsed.data;
  const totalDana = items.reduce((sum, i) => sum + i.nominal, 0);

  const laporan = await prisma.laporanPenggunaan.create({
    data: {
      semester,
      tahunAjaran,
      catatan,
      status,
      totalDana,
      mahasiswaId: mahasiswa.id,
      items: {
        create: items.map((i) => ({
          deskripsi: i.deskripsi,
          nominal:   i.nominal,
          kategori:  i.kategori,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(laporan, { status: 201 });
}

// GET: Ambil laporan milik mahasiswa yang login
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "MAHASISWA") {
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { userId: session.user.id },
    });
    if (!mahasiswa) return NextResponse.json([]);

    const laporan = await prisma.laporanPenggunaan.findMany({
      where: { mahasiswaId: mahasiswa.id, deletedAt: null },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(laporan);
  }

  if (session.user.role === "ADMIN") {
    const laporan = await prisma.laporanPenggunaan.findMany({
      where: { deletedAt: null },
      include: {
        mahasiswa: {
          include: {
            user: { select: { name: true } },
            beasiswa: { select: { nama: true } },
          },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(laporan);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// DELETE: Hard delete draf laporan
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
    where: { id: laporanId, mahasiswaId: mahasiswa?.id },
  });

  if (!laporan) return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });

  // Hanya DRAF yang bisa di-hard delete
  if (laporan.status !== "DRAF") {
    return NextResponse.json({ error: "Hanya draf yang dapat dihapus" }, { status: 400 });
  }

  // Hard delete (beserta items via cascade)
  await prisma.laporanPenggunaan.delete({ where: { id: laporanId } });

  return NextResponse.json({ message: "Laporan berhasil dihapus" });
}
