// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  userId:   z.string(),
  action:   z.enum(["deactivate", "activate"]),
  alasan:   z.string().optional(),
});

// PATCH: Soft delete (deactivate) atau reaktivasi akun mahasiswa
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

  const { userId, action } = parsed.data;

  // Jangan bisa deaktivasi diri sendiri
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Tidak bisa menonaktifkan akun sendiri" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  // Admin tidak bisa di-deactivate oleh admin lain via endpoint ini
  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Tidak dapat menonaktifkan akun admin" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive:  action === "activate",
      deletedAt: action === "deactivate" ? new Date() : null,
    },
    select: { id: true, name: true, email: true, isActive: true, deletedAt: true },
  });

  return NextResponse.json(updated);
}

// GET: List semua user non-admin
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      isActive:  true,
      deletedAt: true,
      createdAt: true,
      mahasiswa: {
        select: {
          nim:     true,
          prodi:   true,
          angkatan: true,
          beasiswa: { select: { nama: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
