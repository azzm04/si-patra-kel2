// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function fillDemo(role: "admin" | "mahasiswa") {
    const demos = {
      admin:     { email: "admin@sipatra.ac.id",      password: "admin123" },
      mahasiswa: { email: "budi@student.undip.ac.id", password: "mahasiswa123" },
    };
    setEmail(demos[role].email);
    setPassword(demos[role].password);
    setError("");
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-950 via-primary-900 to-primary-800 flex-col justify-between p-12 animate-fade-in-up" style={{ animationFillMode: "both" }}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">SI-PATRA</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Sistem Pengawasan &amp; Transparansi Dana Beasiswa
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed">
            Platform pelaporan dan pengawasan penggunaan dana beasiswa yang
            transparan, akuntabel, dan tepat sasaran.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Penerima Aktif", value: "1.240+" },
            { label: "Laporan Tervalidasi", value: "3.800+" },
            { label: "Aduan Terproses", value: "98%" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-primary-200 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
            <span className="font-semibold text-lg text-primary-700">SI-PATRA</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Selamat Datang</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Masuk...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Akun Demo (klik untuk mengisi)</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fillDemo("admin")} className="btn-secondary btn-sm">
                Admin
              </button>
              <button onClick={() => fillDemo("mahasiswa")} className="btn-secondary btn-sm">
                Mahasiswa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
