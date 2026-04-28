// src/app/api/aduan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const aduanSchema = z.object({
  judul:     z.string().min(5, "Judul minimal 5 karakter"),
  deskripsi: z.string().min(20, "Deskripsi minimal 20 karakter"),
  buktiUrl:  z.string().url("URL tidak valid").optional().or(z.literal("")),
  laporanId: z.string().optional(),
  isAnonim:  z.boolean().optional(),   // ← BARU
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body   = await req.json();
  const parsed = aduanSchema.safeParse(body);
  if (!parsed.success) {
    const messages = Object.values(parsed.error.flatten().fieldErrors).flat();
    return NextResponse.json({ error: messages[0] ?? "Validasi gagal" }, { status: 400 });
  }

  const { judul, deskripsi, buktiUrl, laporanId, isAnonim } = parsed.data;

  if (laporanId) {
    const laporan = await prisma.laporanPenggunaan.findUnique({ where: { id: laporanId } });
    if (!laporan) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
    }
  }

  const aduan = await prisma.aduan.create({
    data: {
      judul,
      deskripsi,
      buktiUrl:  buktiUrl || null,
      laporanId: laporanId || null,
      pelaporId: session.user.id,
    },
  });

  return NextResponse.json(aduan, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "ADMIN") {
    const aduan = await prisma.aduan.findMany({
      include: {
        pelapor: { select: { name: true, email: true } },
        laporan: {
          include: {
            mahasiswa: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(aduan);
  }

  if (session.user.role === "MAHASISWA") {
    const aduan = await prisma.aduan.findMany({
      where: { pelaporId: session.user.id },
      include: {
        laporan: {
          include: {
            mahasiswa: {
              include: {
                user:     { select: { name: true } },
                beasiswa: { select: { nama: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(aduan);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}