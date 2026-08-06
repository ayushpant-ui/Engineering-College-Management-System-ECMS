import GalleryGrid from "@/components/modules/gallery/GalleryGrid";

export const metadata = {
  title: "Gallery | School of Engineering",
  description:
    "Photo gallery of campus life, events, labs and workshops at the School of Engineering, Far Western University.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0b1120] px-4 sm:px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <GalleryGrid />
      </div>
    </main>
  );
}
