import SubjectsPage from "@/components/modules/admin/subjects/SubjectsPage";

export const metadata = { title: "Subjects | Admin", robots: { index: false, follow: false } };

export default function SubjectsRoute() {
  return <SubjectsPage />;
}