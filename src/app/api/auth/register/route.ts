import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ── Skema validasi ────────────────────────────────────────────────
const baseSchema = z.object({
  name:     z.string().min(3,  "Nama minimal 3 karakter"),
  email:    z.string().email(  "Format email tidak valid"),
  password: z.string().min(8,  "Password minimal 8 karakter"),
  confirm:  z.string(),
  role:     z.enum(["MAHASISWA", "PELAPOR"]),
});

const mahasiswaSchema = baseSchema.extend({
  role:        z.literal("MAHASISWA"),
  nim:         z.string().min(8,  "NIM minimal 8 karakter"),
  prodi:       z.string().min(2,  "Prodi wajib diisi"),
  angkatan:    z.coerce.number().min(2000).max(2100),
  noHp:        z.string().optional(),
  beasiswaId:  z.string().min(1,  "Pilih program beasiswa"),
});

const pelaporSchema = baseSchema.extend({
  role: z.literal("PELAPOR"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi password match dulu
    if (body.password !== body.confirm) {
      return NextResponse.json(
        { error: "Password dan konfirmasi password tidak cocok" },
        { status: 400 }
      );
    }

    // Pilih schema sesuai role
    const schema = body.role === "MAHASISWA" ? mahasiswaSchema : pelaporSchema;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const msg = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      return NextResponse.json({ error: msg ?? "Data tidak valid" }, { status: 400 });
    }

    const data = parsed.data;

    // Cek email sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Gunakan email lain atau login." },
        { status: 409 }
      );
    }

    // Khusus mahasiswa: cek NIM unik
    if (data.role === "MAHASISWA") {
      const d = data as z.infer<typeof mahasiswaSchema>;
      const nimExist = await prisma.mahasiswa.findUnique({ where: { nim: d.nim } });
      if (nimExist) {
        return NextResponse.json(
          { error: "NIM sudah terdaftar. Hubungi admin jika ini kesalahan." },
          { status: 409 }
        );
      }

      // Cek beasiswa ada dan masih aktif
      const beasiswa = await prisma.beasiswa.findUnique({ where: { id: d.beasiswaId } });
      if (!beasiswa || beasiswa.status !== "AKTIF") {
        return NextResponse.json(
          { error: "Program beasiswa tidak ditemukan atau sudah tidak aktif." },
          { status: 404 }
        );
      }

      // Cek kuota beasiswa
      const jumlahPenerima = await prisma.mahasiswa.count({
        where: { beasiswaId: d.beasiswaId },
      });
      if (jumlahPenerima >= beasiswa.kuota) {
        return NextResponse.json(
          { error: `Kuota beasiswa ${beasiswa.nama} sudah penuh (${beasiswa.kuota} penerima).` },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashed = await bcrypt.hash(data.password, 12);

    // Buat user
    if (data.role === "MAHASISWA") {
      const d = data as z.infer<typeof mahasiswaSchema>;
      await prisma.user.create({
        data: {
          name:     d.name,
          email:    d.email,
          password: hashed,
          role:     "MAHASISWA",
          mahasiswa: {
            create: {
              nim:        d.nim,
              prodi:      d.prodi,
              angkatan:   d.angkatan,
              noHp:       d.noHp || null,
              beasiswaId: d.beasiswaId,
            },
          },
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name:     data.name,
          email:    data.email,
          password: hashed,
          role:     "PELAPOR",
        },
      });
    }

    return NextResponse.json(
      { message: "Registrasi berhasil! Silakan login." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}