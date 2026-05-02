// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  Menu,
  X,
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
    {
      label: "Aduan Saya",
      href: "/dashboard/mahasiswa/aduan",
      icon: ShieldCheck,
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

  // State untuk mengontrol sidebar di tampilan mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mencegah scroll pada body saat menu mobile terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/auth/login" });
  }

  return (
    <>
      {/* Tombol Hamburger (Mobile/Tablet) - Di Kanan Atas */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-3 right-4 z-40 p-2.5 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
        title="Buka Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay Background Blur (Mobile/Tablet) */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible",
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-70 bg-white border-r border-slate-100 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight">
                SI-PATRA
              </div>
              <div className="text-[10px] text-slate-500 leading-tight font-medium mt-0.5">
                Transparansi Beasiswa
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 mt-2">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(isActive ? "nav-link-active" : "nav-link")}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-primary-600" : "text-slate-400",
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowLogoutModal(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Modal Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 zoom-in-95 animate-in duration-200">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-1">
                <h3 className="font-bold text-slate-900 text-lg">
                  Keluar dari Akun?
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Apakah Anda yakin ingin keluar dari sistem?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                Anda akan dikembalikan ke halaman login. Pastikan semua
                pekerjaan yang belum tersimpan telah diamankan.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Keluar...
                  </>
                ) : (
                  "Ya, Keluar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
