// src/app/dashboard/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950/50">
      <Sidebar role={session.user.role} name={session.user.name ?? ""} email={session.user.email ?? ""} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <TopBar user={session.user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
