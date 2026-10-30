import AdminResultsPage from "@/components/modules/admin/results/AdminResultsPage";

export const metadata = {
  title: "Results | Admin",
  robots: { index: false, follow: false },
};

export default function AdminResultsRoute() {
  return <AdminResultsPage />;
}