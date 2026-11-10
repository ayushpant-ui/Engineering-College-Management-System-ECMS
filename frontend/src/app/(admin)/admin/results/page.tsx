import ExamResultsListPage from "@/components/modules/admin/results/ExamResultsListPage";

export const metadata = { title: "Results | Admin", robots: { index: false, follow: false } };

export default function AdminResultsRoute() {
  return <ExamResultsListPage />;
}