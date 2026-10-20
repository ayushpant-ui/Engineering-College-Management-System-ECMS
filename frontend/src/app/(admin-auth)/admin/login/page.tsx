import AdminLoginForm from "@/components/modules/admin/AdminLoginForm";

export const metadata = {
  title: "Admin Login | School of Engineering",
  robots: { index: false, follow: false }, // keep the admin area out of search engines
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <AdminLoginForm />
    </main>
  );
}