export type GalleryCategory =
  | "All"
  | "Campus"
  | "Events"
  | "Labs"
  | "Convocation"
  | "Workshops";

export interface GalleryImage {
  id: string;
  src: string;
  title: string;
  category: Exclude<GalleryCategory, "All">;
  date: string; // e.g. "Mar 2026"
}

// Replace `src` with real image paths (e.g. "/gallery/campus-1.jpg")
// once you have actual photos in /public/gallery.
export const galleryImages: GalleryImage[] = [
  { id: "1", src: "/gallery/campus-1.jpg", title: "Main Academic Block", category: "Campus", date: "Jan 2026" },
  { id: "2", src: "/gallery/campus-2.jpg", title: "Central Library", category: "Campus", date: "Jan 2026" },
  { id: "3", src: "/gallery/lab-1.jpg", title: "Computer Engineering Lab", category: "Labs", date: "Feb 2026" },
  { id: "4", src: "/gallery/lab-2.jpg", title: "Electronics Lab", category: "Labs", date: "Feb 2026" },
  { id: "5", src: "/gallery/event-1.jpg", title: "Tech Fest 2026", category: "Events", date: "Mar 2026" },
  { id: "6", src: "/gallery/event-2.jpg", title: "Freshers' Welcome", category: "Events", date: "Nov 2025" },
  { id: "7", src: "/gallery/workshop-1.jpg", title: "IoT Workshop", category: "Workshops", date: "Apr 2026" },
  { id: "8", src: "/gallery/workshop-2.jpg", title: "AI/ML Bootcamp", category: "Workshops", date: "May 2026" },
  { id: "9", src: "/gallery/convocation-1.jpg", title: "Convocation Ceremony 2025", category: "Convocation", date: "Dec 2025" },
  { id: "10", src: "/gallery/convocation-2.jpg", title: "Gold Medalists 2025", category: "Convocation", date: "Dec 2025" },
  { id: "11", src: "/gallery/campus-3.jpg", title: "Engineering Auditorium", category: "Campus", date: "Jan 2026" },
  { id: "12", src: "/gallery/event-3.jpg", title: "Sports Week", category: "Events", date: "Jun 2026" },
];

export const galleryCategories: GalleryCategory[] = [
  "All",
  "Campus",
  "Events",
  "Labs",
  "Workshops",
  "Convocation",
];