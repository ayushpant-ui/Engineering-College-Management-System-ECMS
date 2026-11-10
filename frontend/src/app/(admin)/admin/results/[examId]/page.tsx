import ExamMarksPage from "@/components/modules/admin/results/ExamMarksPage";

export const metadata = { title: "Exam Results | Admin", robots: { index: false, follow: false } };

export default async function AdminExamResultsRoute({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  return <ExamMarksPage examId={Number(examId)} />;
}