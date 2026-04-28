// src/app/api/auth/verify-otp-register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  otp:   z.string().length(6, "OTP harus 6 digit"),
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

    const { email, otp } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Cari OTP terbaru untuk email ini
    const otpToken = await prisma.otpToken.findFirst({
      where:   { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!otpToken) {
      return NextResponse.json(
        { error: "Tidak ada OTP aktif. Silakan minta OTP baru." },
        { status: 400 }
      );
    }

    // Cek expired
    if (otpToken.expiresAt < new Date()) {
      await prisma.otpToken.delete({ where: { id: otpToken.id } });
      return NextResponse.json(
        { error: "Kode OTP sudah kedaluwarsa. Silakan minta OTP baru." },
        { status: 400 }
      );
    }

    // Verifikasi kode
    const isValid = await verifyOtp(otp, otpToken.code);
    if (!isValid) {
      return NextResponse.json(
        { error: "Kode OTP salah. Periksa kembali email Anda." },
        { status: 401 }
      );
    }

    // OTP valid → hapus token, ambil info beasiswa
    await prisma.otpToken.delete({ where: { id: otpToken.id } });

    const whitelist = await prisma.emailWhitelist.findUnique({
      where:   { email: normalizedEmail },
      include: { beasiswa: { select: { id: true, nama: true } } },
    });

    return NextResponse.json({
      success:    true,
      email:      normalizedEmail,
      beasiswaId: whitelist?.beasiswaId,
      beasiswa:   whitelist?.beasiswa.nama,
    });

  } catch (err) {
    console.error("[verify-otp-register]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}