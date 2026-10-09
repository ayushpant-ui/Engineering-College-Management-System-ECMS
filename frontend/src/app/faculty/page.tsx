import FacultySection from "@/components/modules/faculty/Facultysection";

export const metadata = {
  title: "Faculty | School of Engineering",
  description:
    "Meet the faculty members of the School of Engineering, Far Western University.",
};

export default function FacultyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0b1120] px-4 sm:px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <FacultySection />
      </div>
    </main>
  );
}