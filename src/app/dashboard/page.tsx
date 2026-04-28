// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  if (session.user.role === "ADMIN")     redirect("/dashboard/admin");
  if (session.user.role === "MAHASISWA") redirect("/dashboard/mahasiswa");

  redirect("/auth/login");
}
