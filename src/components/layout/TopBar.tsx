// src/components/layout/TopBar.tsx
"use client";

import ThemeToggle from "@/components/ThemeToggle";

interface TopBarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function TopBar({ user }: TopBarProps) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between pl-6 pr-16 lg:pr-6 flex-shrink-0 sticky top-0 z-30">
      <div className="flex flex-col justify-center min-w-0 pr-4">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          Selamat datang kembali, {user.name}!
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{today}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <ThemeToggle />

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

        <button className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-1.5 pr-2 rounded-full transition-colors text-left group focus:outline-none focus:ring-2 focus:ring-primary-100">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-800 shadow-sm flex-shrink-0">
            {initials}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-wider font-semibold">
              {user.role === "MAHASISWA"
                ? "Penerima Beasiswa"
                : user.role || "User"}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
