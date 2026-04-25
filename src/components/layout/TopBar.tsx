// src/components/layout/TopBar.tsx
"use client";

interface TopBarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function TopBar({ user }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <p className="text-sm text-slate-500">
          Selamat datang kembali,{" "}
          <span className="font-semibold text-slate-800">{user.name}</span>
        </p>
      </div>
    </header>
  );
}
