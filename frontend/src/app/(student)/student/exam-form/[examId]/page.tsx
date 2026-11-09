import ExamFormPage from "@/components/modules/student/exams/ExamFormPage";

export const metadata = { title: "Exam Form | School of Engineering" };

export default async function ExamFormRoute({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  return <ExamFormPage examId={examId} />;
}