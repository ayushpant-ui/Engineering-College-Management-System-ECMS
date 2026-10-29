import AdminStudentsPage from "@/components/modules/admin/students/AdminStudentsPage";

export const metadata = {
  title: "Students | Admin",
  robots: { index: false, follow: false },
};

export default function AdminStudentsRoute() {
  return <AdminStudentsPage />;
}