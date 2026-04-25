// src/app/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth();

  if (!session) redirect("/auth/login");

  const role = session.user.role;
  if (role === "ADMIN") redirect("/dashboard/admin");
  if (role === "MAHASISWA") redirect("/dashboard/mahasiswa");
  if (role === "PELAPOR") redirect("/dashboard/pelapor");

  redirect("/auth/login");
}
