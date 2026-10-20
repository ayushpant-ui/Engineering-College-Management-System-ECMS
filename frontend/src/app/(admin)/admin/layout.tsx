import AdminShell from "@/components/modules/admin/AdminShell";

export const metadata = {
  title: "Admin | School of Engineering",
  robots: { index: false, follow: false },
};

// Every page inside app/(admin)/admin/ is wrapped by this guard.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}