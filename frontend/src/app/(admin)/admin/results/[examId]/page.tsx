import ExamGradesPage from "@/components/modules/admin/results/ExamGradesPage";

export const metadata = { title: "Exam Results | Admin", robots: { index: false, follow: false } };

export default async function AdminExamResultsRoute({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  return <ExamGradesPage examId={Number(examId)} />;
}