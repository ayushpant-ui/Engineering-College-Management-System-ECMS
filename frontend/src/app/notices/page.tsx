import NoticesSection from "@/components/modules/notices/NoticeSection";

export const metadata = {
  title: "Notices | School of Engineering",
  description:
    "Latest notices, announcements, exam routines and admission updates from the School of Engineering.",
};

export default function NoticesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0b1120] px-4 sm:px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <NoticesSection />
      </div>
    </main>
  );
}