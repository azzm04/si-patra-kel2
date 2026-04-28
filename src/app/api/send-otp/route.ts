// src/app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    // 1. Cek apakah email ada di whitelist
    const whitelist = await prisma.emailWhitelist.findUnique({
      where:   { email },
      include: { beasiswa: { select: { id: true, nama: true, kuota: true } } },
    });

    if (!whitelist) {
      return NextResponse.json(
        { error: "Email tidak terdaftar sebagai penerima beasiswa. Hubungi admin jika ada kesalahan." },
        { status: 403 }
      );
    }

    // 2. Cek apakah sudah pernah registrasi
    if (whitelist.isUsed) {
      return NextResponse.json(
        { error: "Email ini sudah digunakan untuk registrasi. Silakan login atau hubungi admin." },
        { status: 409 }
      );
    }

    // 3. Cek kuota beasiswa
    const jumlahPenerima = await prisma.mahasiswa.count({
      where: { beasiswaId: whitelist.beasiswaId },
    });

    if (jumlahPenerima >= whitelist.beasiswa.kuota) {
      return NextResponse.json(
        { error: `Kuota beasiswa ${whitelist.beasiswa.nama} sudah penuh (${whitelist.beasiswa.kuota} penerima).` },
        { status: 400 }
      );
    }

    // 4. Hapus OTP lama untuk email ini
    await prisma.otpToken.deleteMany({ where: { email } });

    // 5. Generate & simpan OTP baru
    const otp    = generateOtp();
    const hashed = await hashOtp(otp);

    await prisma.otpToken.create({
      data: {
        email,
        code:      hashed,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 menit
      },
    });

    // 6. Kirim OTP ke email
    await sendOtpEmail(email, otp, email.split("@")[0]);

    return NextResponse.json({
      success:    true,
      beasiswa:   whitelist.beasiswa.nama,
      beasiswaId: whitelist.beasiswaId,
      message:    `Kode OTP telah dikirim ke ${email}. Berlaku 5 menit.`,
    });

  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json(
      { error: "Gagal mengirim OTP. Coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}