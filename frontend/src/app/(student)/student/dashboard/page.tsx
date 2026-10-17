import StudentDashboard from "@/components/modules/dashboard/StudentDashboard";

export const metadata = {
  title: "Student Dashboard | School of Engineering",
};

// Next.js pages need a DEFAULT export.
export default function StudentDashboardPage() {
  return <StudentDashboard />;
}