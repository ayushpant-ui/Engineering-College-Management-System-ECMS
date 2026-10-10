// Mirrors the Prisma `NoticeCategory` enum in the backend.
export type NoticeCategory = "GENERAL" | "ACADEMIC" | "EXAM" | "ADMISSION" | "EVENT";

export const noticeCategories: { value: NoticeCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "GENERAL", label: "General" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "EXAM", label: "Exam" },
  { value: "ADMISSION", label: "Admission" },
  { value: "EVENT", label: "Event" },
];

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  isPinned: boolean;
  publishedAt: string; 
  attachmentUrl?: string; 
}


// Later can fetch from GET /api/v1/notices using (Prisma Notice model).
export const notices: Notice[] = [
  {
    id: "n1",
    title: "Admission Open for Academic Year 2026/27",
    body: "Applications are now open for the Bachelor of Engineering programs. Interested candidates should submit the completed application form along with required documents at the administration office before the deadline. Contact the college office for details about eligibility and entrance procedures.",
    category: "ADMISSION",
    isPinned: true,
    publishedAt: "2026-08-05",
    attachmentUrl: "/notices/admission-form.pdf",
  },
  {
    id: "n2",
    title: "Fourth Semester Examination Routine Published",
    body: "The examination routine for the fourth semester has been published. Students are advised to collect their admit cards from the examination section at least two days before the first exam. Carry your college ID on all exam days.",
    category: "EXAM",
    isPinned: true,
    publishedAt: "2026-08-03",
    attachmentUrl: "/notices/exam-routine.pdf",
  },
  {
    id: "n3",
    title: "Tech Fest 2026 — Project Registration",
    body: "Students interested in showcasing projects at Tech Fest 2026 should register their teams with their department coordinators. Each team may have up to four members.",
    category: "EVENT",
    isPinned: false,
    publishedAt: "2026-07-28",
  },
  {
    id: "n4",
    title: "Revised Class Schedule for Third Semester",
    body: "Due to faculty availability, the class schedule for the third semester has been revised. Updated timetables are available on the department notice boards.",
    category: "ACADEMIC",
    isPinned: false,
    publishedAt: "2026-07-20",
  },
  {
    id: "n5",
    title: "College Closed on Public Holiday",
    body: "The college will remain closed on the upcoming public holiday. Regular classes resume the following working day.",
    category: "GENERAL",
    isPinned: false,
    publishedAt: "2026-07-15",
  },
];