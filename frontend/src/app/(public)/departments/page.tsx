import DepartmentsSection from "@/components/modules/departments/Departmentssection";

export const metadata = {
  title: "Departments | School of Engineering",
  description:
    "Academic departments of the School of Engineering, Far Western University.",
};

export default function DepartmentsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0b1120] px-4 sm:px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <DepartmentsSection />
      </div>
    </main>
  );
}