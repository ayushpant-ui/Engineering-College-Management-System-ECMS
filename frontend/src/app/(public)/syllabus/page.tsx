import { Suspense } from "react";
import SyllabusSection from "@/components/modules/syllabus/SyllabusSection";

export const metadata = {
  title: "Syllabus | School of Engineering",
  description:
    "Download the semester-wise syllabus (semester 1 to 8) for Computer, Civil and Architecture Engineering at the School of Engineering, Far Western University.",
};

// The shared site layout already provides <main>, so this page uses a plain <div>.
export default function SyllabusPage() {
  return (
    <div className="mx-auto max-w-6xl py-4">
      {/* useSearchParams() in the section needs a Suspense boundary */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />}>
        <SyllabusSection />
      </Suspense>
    </div>
  );
}