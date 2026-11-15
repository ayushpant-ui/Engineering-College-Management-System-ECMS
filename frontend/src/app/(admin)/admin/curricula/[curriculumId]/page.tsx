import CurriculumDetailPage from "@/components/modules/admin/curricula/CurriculumDetailPage";

export const metadata = { title: "Curriculum | Admin", robots: { index: false, follow: false } };

export default async function CurriculumDetailRoute({ params }: { params: Promise<{ curriculumId: string }> }) {
  const { curriculumId } = await params;
  return <CurriculumDetailPage curriculumId={Number(curriculumId)} />;
}