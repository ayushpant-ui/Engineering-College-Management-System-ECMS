import AdminExamDetailPage from "@/components/modules/admin/exams/AdminExamDetailPage";

export const metadata = { title: "Exam | Admin", robots: { index: false, follow: false } };

export default async function AdminExamDetailRoute({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  return <AdminExamDetailPage examId={examId} />;
}