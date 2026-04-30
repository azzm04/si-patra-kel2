// src/app/api/admin/beasiswa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const beasiswaSchema = z.object({
  nama:               z.string().min(2),
  penyelenggara:      z.string().min(2),
  kuota:              z.number().int().positive(),
  nominalPerSemester: z.number().positive(),
  deskripsi:          z.string().optional(),
  status:             z.enum(["AKTIF", "NONAKTIF"]).optional(),
});

async function requireAdmin(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// POST: Tambah beasiswa baru
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = beasiswaSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const beasiswa = await prisma.beasiswa.create({ data: parsed.data });
  return NextResponse.json(beasiswa, { status: 201 });
}

// PUT: Edit beasiswa
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

  const body = await req.json();
  const parsed = beasiswaSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const existing = await prisma.beasiswa.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Beasiswa tidak ditemukan" }, { status: 404 });

  const updated = await prisma.beasiswa.update({
    where: { id },
    data:  parsed.data,
  });
  return NextResponse.json(updated);
}

// GET: List semua beasiswa
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const beasiswa = await prisma.beasiswa.findMany({
    include: { _count: { select: { mahasiswa: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(beasiswa);
}
