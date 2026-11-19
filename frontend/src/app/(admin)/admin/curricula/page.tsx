import CurriculaPage from "@/components/modules/admin/curricula/CurriculaPage";

export const metadata = { title: "Curricula | Admin", robots: { index: false, follow: false } };

export default function CurriculaRoute() {
  return <CurriculaPage />;
}