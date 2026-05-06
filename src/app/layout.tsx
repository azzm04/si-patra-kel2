<<<<<<< HEAD
// src/app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
=======
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SI-PATRA | Sistem Informasi Pengawasan dan Transparansi Dana Beasiswa",
  description:
    "Platform pengawasan dan transparansi penggunaan dana beasiswa Universitas Diponegoro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="id" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider>
=======
    <html lang="id" suppressHydrationWarning className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
>>>>>>> b1c4d863d546705064dadbc28b0e9d9f4f85128d
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
