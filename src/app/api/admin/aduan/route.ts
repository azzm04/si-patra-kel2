// src/app/api/admin/aduan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  aduanId:  z.string(),
  status:   z.enum(["DIPROSES", "SELESAI", "DITOLAK"]),
  catatan:  z.string().optional(),
});

// PATCH: Update status aduan
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

  const { aduanId, status, catatan } = parsed.data;

  const aduan = await prisma.aduan.findUnique({ where: { id: aduanId } });
  if (!aduan) return NextResponse.json({ error: "Aduan tidak ditemukan" }, { status: 404 });

  const updated = await prisma.aduan.update({
    where: { id: aduanId },
    data: { status, catatanAdmin: catatan || null },
  });

  return NextResponse.json(updated);
}
