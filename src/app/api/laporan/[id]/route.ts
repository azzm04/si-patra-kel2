// src/app/api/laporan/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Semester, KategoriItem } from "@prisma/client";

const itemSchema = z.object({
  deskripsi: z.string().min(1, "Deskripsi wajib diisi"),
  nominal:   z.number().positive("Nominal harus lebih dari 0"),
  kategori:  z.nativeEnum(KategoriItem),
});

const laporanUpdateSchema = z.object({
  semester:    z.nativeEnum(Semester),
  tahunAjaran: z.string().regex(/^\d{4}\/\d{4}$/, "Format tahun ajaran: 2024/2025"),
  catatan:     z.string().optional(),
  status:      z.enum(["DRAF", "TERKIRIM"]),
  items:       z.array(itemSchema).min(1, "Minimal harus ada 1 rincian dana"),
});

// PUT: Edit/Update Laporan berdasarkan ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = laporanUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const messages = Object.values(parsed.error.flatten().fieldErrors).flat();
    return NextResponse.json({ error: messages[0] ?? "Validasi gagal" }, { status: 400 });
  }

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: session.user.id },
  });

  const laporanLama = await prisma.laporanPenggunaan.findFirst({
    where: { id: params.id, mahasiswaId: mahasiswa?.id, deletedAt: null },
  });

  if (!laporanLama) {
    return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
  }

  // VALIDASI UTAMA: Jika sudah divalidasi, tolak aksi edit
  if (laporanLama.status === "DIVALIDASI") {
    return NextResponse.json(
      { error: "Laporan yang sudah divalidasi tidak dapat diedit." },
      { status: 403 }
    );
  }

  const { semester, tahunAjaran, catatan, status, items } = parsed.data;
  const totalDana = items.reduce((sum, i) => sum + i.nominal, 0);

  // Gunakan Transaction agar penghapusan item lama dan pembuatan item baru aman
  try {
    const updatedLaporan = await prisma.$transaction(async (tx) => {
      // 1. Hapus semua rincian dana yang lama
      await tx.itemLaporan.deleteMany({
        where: { laporanId: params.id },
      });

      // 2. Update data laporan induk dan masukkan rincian dana yang baru
      return await tx.laporanPenggunaan.update({
        where: { id: params.id },
        data: {
          semester,
          tahunAjaran,
          catatan,
          status, 
          totalDana,
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
    });

    return NextResponse.json(updatedLaporan, { status: 200 });
  } catch (error) {
    console.error("Gagal update laporan:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}