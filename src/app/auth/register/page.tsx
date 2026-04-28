"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  BookOpen,
  Hash,
  GraduationCap,
  Phone,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Send,
  RotateCcw,
} from "lucide-react";

type Step = "email" | "otp" | "akun" | "detail";

const PRODI_LIST = [
  "Teknik Komputer",
  "Teknik Informatika",
  "Sistem Informasi",
  "Teknik Elektro",
  "Teknik Mesin",
  "Teknik Sipil",
  "Teknik Kimia",
  "Teknik Industri",
  "Matematika",
  "Fisika",
  "Lainnya",
];

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Data dari server setelah OTP verified
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedBeasiswaId, setVerifiedBeasiswaId] = useState("");
  const [verifiedBeasiswa, setVerifiedBeasiswa] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirm: "",
    nim: "",
    prodi: "",
    prodiCustom: "",
    angkatan: String(new Date().getFullYear()),
    noHp: "",
  });

  // Cooldown timer kirim ulang OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  }

  // ── OTP input handler ─────────────────────────────────────────────
  function handleOtpChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return; // hanya angka
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    // Auto focus next
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      document.getElementById("otp-5")?.focus();
    }
    e.preventDefault();
  }

  // ── Step 1: Kirim OTP ke email ────────────────────────────────────
  async function handleSendOtp() {
    if (!form.email.includes("@")) {
      setError("Masukkan email yang valid.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    const data = await res.json();

    if (res.ok) {
      setVerifiedBeasiswaId(data.beasiswaId);
      setVerifiedBeasiswa(data.beasiswa);
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
      setCooldown(60);
    } else {
      setError(data.error);
    }
    setLoading(false);
  }

  // ── Kirim ulang OTP ───────────────────────────────────────────────
  async function handleResend() {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    const data = await res.json();
    if (res.ok) {
      setOtp(["", "", "", "", "", ""]);
      setCooldown(60);
    } else {
      setError(data.error);
    }
    setLoading(false);
  }

  // ── Step 2: Verifikasi OTP ────────────────────────────────────────
  async function handleVerifyOtp() {
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, otp: otpStr }),
    });
    const data = await res.json();

    if (res.ok) {
      setVerifiedEmail(data.email);
      setStep("akun");
    } else {
      setError(data.error);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    }
    setLoading(false);
  }

  // ── Step 3: Validasi data akun lalu lanjut ────────────────────────
  function handleNextToDetail() {
    if (form.name.trim().length < 3) {
      setError("Nama minimal 3 karakter.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Password tidak cocok.");
      return;
    }
    setError("");
    setStep("detail");
  }

  // ── Step 4: Submit registrasi ─────────────────────────────────────
  async function handleSubmit() {
    if (!form.nim.trim()) {
      setError("NIM wajib diisi.");
      return;
    }
    if (!form.prodi) {
      setError("Prodi wajib dipilih.");
      return;
    }
    if (form.prodi === "Lainnya" && !form.prodiCustom.trim()) {
      setError("Nama prodi wajib diisi.");
      return;
    }
    if (Number(form.angkatan) > new Date().getFullYear()) {
      setError(`Angkatan maksimal ${new Date().getFullYear()}.`);
      return;
    }
    setLoading(true);
    setError("");

    const prodiFinal =
      form.prodi === "Lainnya" ? form.prodiCustom.trim() : form.prodi;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: verifiedEmail,
        password: form.password,
        confirm: form.confirm,
        role: "MAHASISWA",
        nim: form.nim,
        prodi: prodiFinal,
        angkatan: Number(form.angkatan),
        noHp: form.noHp,
        beasiswaId: verifiedBeasiswaId,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } else {
      setError(data.error ?? "Registrasi gagal.");
    }
    setLoading(false);
  }

  // ── Step indicator config ─────────────────────────────────────────
  const steps = [
    { key: "email", label: "Email" },
    { key: "otp", label: "OTP" },
    { key: "akun", label: "Akun" },
    { key: "detail", label: "Detail" },
  ];
  const stepIdx = steps.findIndex((s) => s.key === step);

  // ── Success ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm px-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Registrasi Berhasil!
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Akun Anda telah dibuat. Mengalihkan ke halaman login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-navy-950 via-primary-900 to-primary-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">SI-PATRA</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Registrasi dengan
            <br />
            Verifikasi OTP
          </h1>
          <p className="text-primary-200 text-sm leading-relaxed mb-8">
            Hanya penerima beasiswa yang terdaftar dapat membuat akun. Kode OTP
            akan dikirim ke email Anda untuk memastikan keamanan akun.
          </p>

          {/* Flow diagram */}
          <div className="space-y-3">
            {[
              { n: "1", text: "Masukkan email penerima beasiswa" },
              { n: "2", text: "Verifikasi kode OTP (6 digit)" },
              { n: "3", text: "Isi data akun & akademik" },
              { n: "4", text: "Akun siap digunakan" },
            ].map((f) => (
              <div key={f.n} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{f.n}</span>
                </div>
                <p className="text-primary-200 text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-300 text-sm">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="text-white font-medium hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
            <span className="font-semibold text-lg text-primary-700">
              SI-PATRA
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {steps.map((s, idx) => (
              <div
                key={s.key}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      idx < stepIdx
                        ? "bg-primary-600 border-primary-600 text-white"
                        : idx === stepIdx
                          ? "border-primary-600 text-primary-600 bg-white"
                          : "border-slate-200 text-slate-300 bg-white"
                    }`}
                  >
                    {idx < stepIdx ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      idx <= stepIdx ? "text-primary-600" : "text-slate-300"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-4 transition-colors ${
                      idx < stepIdx ? "bg-primary-400" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* ── STEP: Email ──────────────────────────────────────── */}
          {step === "email" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Verifikasi Email
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Masukkan email yang terdaftar sebagai penerima beasiswa
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
                <p className="font-semibold mb-1">📋 Catatan Penting</p>
                <p>
                  Hanya email yang telah didaftarkan oleh admin sebagai penerima
                  beasiswa KIP-K atau Bidikmisi yang dapat mendaftar.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Penerima Beasiswa{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    className="input pl-10"
                    placeholder="emailkamu@gmail.com"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="btn-primary w-full py-2.5"
              >
                <Send className="w-4 h-4" />
                {loading ? "Mengirim OTP..." : "Kirim Kode OTP"}
              </button>

              <p className="text-center text-sm text-slate-500">
                Sudah punya akun?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Masuk
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP: OTP ────────────────────────────────────────── */}
          {step === "otp" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Masukkan Kode OTP
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Kode 6 digit telah dikirim ke{" "}
                  <span className="font-semibold text-slate-700">
                    {form.email}
                  </span>
                </p>
              </div>

              {/* Badge beasiswa */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200">
                <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-xs font-semibold text-primary-700">
                  Penerima: {verifiedBeasiswa}
                </span>
              </div>

              {/* OTP input boxes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Kode OTP <span className="text-red-500">*</span>
                </label>
                <div
                  className="flex gap-2 justify-center"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      title="input"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                        digit
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-slate-200 bg-white text-slate-900"
                      } focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Kode berlaku selama 5 menit · Anda bisa paste langsung
                </p>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length < 6}
                className="btn-primary w-full py-2.5"
              >
                {loading ? "Memverifikasi..." : "Verifikasi Kode OTP"}
              </button>

              {/* Kirim ulang */}
              <div className="text-center">
                <p className="text-sm text-slate-500">
                  Tidak menerima kode?{" "}
                  <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || loading}
                    className="text-primary-600 font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {cooldown > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        Kirim ulang ({cooldown}s)
                      </span>
                    ) : (
                      "Kirim ulang"
                    )}
                  </button>
                </p>
              </div>

              <button
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Ganti email
              </button>
            </div>
          )}

          {/* ── STEP: Akun ───────────────────────────────────────── */}
          {step === "akun" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Data Akun</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Buat nama dan password untuk akun Anda
                </p>
              </div>

              {/* Email verified badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-green-700">
                    Email Terverifikasi
                  </p>
                  <p className="text-xs text-green-600 truncate">
                    {verifiedEmail}
                  </p>
                </div>
                <span className="ml-auto badge bg-primary-100 text-primary-700 text-[10px] flex-shrink-0">
                  {verifiedBeasiswa}
                </span>
              </div>

              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Nama sesuai KTP"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          form.password.length >= i * 2 + 2
                            ? i <= 1
                              ? "bg-red-400"
                              : i <= 2
                                ? "bg-yellow-400"
                                : i <= 3
                                  ? "bg-blue-400"
                                  : "bg-green-500"
                            : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Konfirmasi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={handleChange}
                    className={`input pl-10 pr-10 ${
                      form.confirm && form.confirm !== form.password
                        ? "border-red-300"
                        : form.confirm && form.confirm === form.password
                          ? "border-green-300"
                          : ""
                    }`}
                    placeholder="Ulangi password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-red-500 mt-1">
                    Password tidak cocok
                  </p>
                )}
              </div>

              <button
                onClick={handleNextToDetail}
                className="btn-primary w-full py-2.5 mt-2"
              >
                Lanjutkan <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP: Detail Mahasiswa ────────────────────────────── */}
          {step === "detail" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Data Mahasiswa
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Lengkapi data akademik Anda
                </p>
              </div>

              {/* NIM */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  NIM <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="nim"
                    type="text"
                    value={form.nim}
                    onChange={handleChange}
                    className="input pl-10 font-mono"
                    placeholder="cth: 21120123140001"
                  />
                </div>
              </div>

              {/* Prodi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Program Studi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="prodi"
                    value={form.prodi}
                    onChange={handleChange}
                    className="input pl-10"
                    title="prodi"
                  >
                    <option value="">-- Pilih Program Studi --</option>
                    {PRODI_LIST.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                {form.prodi === "Lainnya" && (
                  <div className="mt-2">
                    <input
                      name="prodiCustom"
                      type="text"
                      value={form.prodiCustom}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.]/g, "");
                        setForm((p) => ({ ...p, prodiCustom: val }));
                      }}
                      className="input"
                      placeholder="Tulis nama program studi Anda..."
                      maxLength={60}
                      autoFocus
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Hanya huruf dan spasi
                    </p>
                  </div>
                )}
              </div>

              {/* Angkatan + No HP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Angkatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="angkatan"
                    type="number"
                    title="angkatan"
                    value={form.angkatan}
                    onChange={handleChange}
                    className="input font-mono"
                    min="2000"
                    max={new Date().getFullYear()}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Maks. {new Date().getFullYear()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    No. HP
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="noHp"
                      type="tel"
                      value={form.noHp}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="08xx"
                    />
                  </div>
                </div>
              </div>

              {/* Info beasiswa otomatis */}
              <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
                <p className="text-xs text-primary-500 font-medium mb-0.5">
                  Program Beasiswa (otomatis)
                </p>
                <p className="text-sm font-semibold text-primary-800">
                  {verifiedBeasiswa}
                </p>
                <p className="text-xs text-primary-400 mt-0.5">
                  Ditentukan berdasarkan email yang terverifikasi
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep("akun");
                    setError("");
                  }}
                  className="btn-secondary flex-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
