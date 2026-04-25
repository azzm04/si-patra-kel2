// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Users,
  BookOpen,
  ShieldCheck,
  PlusCircle,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navByRole: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Mahasiswa", href: "/dashboard/admin/mahasiswa", icon: Users },
    { label: "Beasiswa", href: "/dashboard/admin/beasiswa", icon: BookOpen },
    { label: "Laporan", href: "/dashboard/admin/laporan", icon: FileText },
    { label: "Aduan", href: "/dashboard/admin/aduan", icon: AlertTriangle },
  ],
  MAHASISWA: [
    { label: "Dashboard", href: "/dashboard/mahasiswa", icon: LayoutDashboard },
    {
      label: "Laporan Saya",
      href: "/dashboard/mahasiswa/laporan",
      icon: ClipboardList,
    },
    {
      label: "Buat Laporan",
      href: "/dashboard/mahasiswa/laporan/baru",
      icon: PlusCircle,
    },
  ],
  PELAPOR: [
    { label: "Dashboard", href: "/dashboard/pelapor", icon: LayoutDashboard },
    {
      label: "Aduan Saya",
      href: "/dashboard/pelapor/aduan",
      icon: AlertTriangle,
    },
    {
      label: "Kirim Aduan",
      href: "/dashboard/pelapor/aduan/baru",
      icon: PlusCircle,
    },
  ],
};

interface SidebarProps {
  role: string;
  name: string;
  email: string;
}

export default function Sidebar({ role, name, email }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role] ?? [];
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrator",
    MAHASISWA: "Penerima Beasiswa",
    PELAPOR: "Pelapor",
  };

  async function handleLogout() {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/auth/login" });
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col z-10 hidden lg:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight">
                SI-PATRA
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Transparansi Beasiswa
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard/admin" ||
              item.href === "/dashboard/mahasiswa" ||
              item.href === "/dashboard/pelapor"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(isActive ? "nav-link-active" : "nav-link")}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-700 text-sm font-semibold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {name}
              </p>
              <p className="text-xs text-slate-400 truncate">{roleLabel[role]}</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden lg:flex">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Keluar dari Akun</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Apakah Anda yakin ingin keluar dari sistem?
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
              Anda akan dikembalikan ke halaman login. Pastikan semua pekerjaan telah disimpan.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {isLoggingOut ? "Keluar..." : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
