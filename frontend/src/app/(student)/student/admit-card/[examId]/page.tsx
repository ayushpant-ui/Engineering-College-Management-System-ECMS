import AdmitCardView from "@/components/modules/student/exams/AdmitCardView";

export const metadata = { title: "Admit Card | School of Engineering" };

export default async function AdmitCardRoute({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  return <AdmitCardView examId={examId} />;
}