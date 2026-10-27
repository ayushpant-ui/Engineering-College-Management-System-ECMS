import AdminNoticesPage from "@/components/modules/admin/notices/AdminNoticesPage";

export const metadata = {
  title: "Notices | Admin",
  robots: { index: false, follow: false },
};

export default function AdminNoticesRoute() {
  return <AdminNoticesPage />;
}