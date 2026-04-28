// src/lib/otp.ts
import bcrypt from "bcryptjs";

/** Generate 6-digit OTP */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Hash OTP sebelum disimpan ke DB */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/** Verifikasi OTP input vs hash */
export async function verifyOtp(otp: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(otp, hashed);
}