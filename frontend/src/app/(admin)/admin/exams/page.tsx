import AdminExamsPage from "@/components/modules/admin/exams/AdminExamsPage";

export const metadata = { title: "Exams | Admin", robots: { index: false, follow: false } };

export default function AdminExamsRoute() {
  return <AdminExamsPage />;
}