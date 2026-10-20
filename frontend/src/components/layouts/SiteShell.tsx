import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import AppSidebar from "@/components/sidebar/AppSidebar";
import Navbar from "@/components/modules/navbar/Navbar";
import Footer from "@/components/modules/footer/Footer";

// The public website chrome (exactly what your old root layout wrapped around pages).
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}