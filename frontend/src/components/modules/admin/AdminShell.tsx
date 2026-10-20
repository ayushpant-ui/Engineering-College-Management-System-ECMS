"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/components/modules/navbar/ThemeToggle";
import {
  clearAdminSession,
  getAdminSession,
  type AdminUser,
} from "@/lib/admin-session";
import AdminSidebar from "./AdminSidebar";

const LOGIN_PATH = "/admin/login";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  // Role/session check on first load and on every navigation inside /admin
  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      router.replace(LOGIN_PATH);
      return;
    }
    setAdmin(session.user);
  }, [pathname, router]);

  // Auto-logout the moment the token expires
  useEffect(() => {
    const session = getAdminSession();
    if (!session) return;
    const msLeft = Math.min(Math.max(session.expiresAt - Date.now(), 0), 2 ** 31 - 1);
    const timer = setTimeout(() => {
      clearAdminSession();
      router.replace(LOGIN_PATH);
    }, msLeft);
    return () => clearTimeout(timer);
  }, [pathname, router]);

  function logout() {
    clearAdminSession();
    router.replace(LOGIN_PATH);
  }

  // Render nothing until we know the visitor is an admin (prevents a flash of admin UI)
  if (!admin) {
    return <p className="p-8 text-sm text-muted-foreground">Checking access...</p>;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground sm:block">{admin.email}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:border-red-400 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}