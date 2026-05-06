// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Status badge colors
export const statusLaporanConfig = {
  DRAF:       { label: "Draf",      color: "bg-gray-100 text-gray-700" },
  TERKIRIM:   { label: "Terkirim",  color: "bg-blue-100 text-blue-700" },
  DIVALIDASI: { label: "Divalidasi",color: "bg-green-100 text-green-700" },
  DITOLAK:    { label: "Ditolak",   color: "bg-red-100 text-red-700" },
} as const;

export const statusAduanConfig = {
  MENUNGGU: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
  DIPROSES: { label: "Diproses", color: "bg-blue-100 text-blue-700" },
  SELESAI:  { label: "Selesai",  color: "bg-green-100 text-green-700" },
  DITOLAK:  { label: "Ditolak",  color: "bg-red-100 text-red-700" },
} as const;
