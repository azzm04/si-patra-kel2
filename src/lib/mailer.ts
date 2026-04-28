// src/lib/mailer.ts
import nodemailer from "nodemailer";

export async function sendOtpEmail(to: string, otp: string, nama: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📧 OTP untuk ${to} : ${otp}`);
  console.log(`${"=".repeat(50)}\n`);

  // Kirim email di semua environment (dev & production)
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from:    `"SI-PATRA" <${process.env.SMTP_USER}>`,
    to,
    subject: "Kode OTP Registrasi SI-PATRA",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <div style="background:#1d4ed8;padding:20px 24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">🛡️ SI-PATRA</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Sistem Transparansi Dana Beasiswa</p>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-top:none;padding:28px 24px;border-radius:0 0 12px 12px">
          <p style="color:#334155;margin:0 0 8px">Halo, <strong>${nama}</strong>!</p>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px">
            Berikut kode OTP untuk verifikasi registrasi akun SI-PATRA Anda.
            Kode berlaku selama <strong>5 menit</strong>.
          </p>
          <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px">
            <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px">Kode OTP</p>
            <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:10px;color:#1d4ed8;font-family:monospace">
              ${otp}
            </p>
          </div>
          <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin:0 0 20px">
            <p style="margin:0;font-size:13px;color:#92400e">
              ⚠️ Jangan bagikan kode ini kepada siapapun, termasuk admin.
            </p>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0">
            Email ini dikirim otomatis oleh sistem SI-PATRA.
          </p>
        </div>
      </div>
    `,
  });
}