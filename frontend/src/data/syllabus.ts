export type SyllabusDeptSlug = "computer" | "civil" | "architecture";

export interface SyllabusDepartment {
  slug: SyllabusDeptSlug;
  name: string;
  code: string;
  folder: string; // folder inside public/syllabus/
  available: number[]; // semesters whose PDF exists
}

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const syllabusDepartments: SyllabusDepartment[] = [
  {
    slug: "computer",
    name: "Computer Engineering",
    code: "CE",
    folder: "ce",
    available: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    slug: "civil",
    name: "Civil Engineering",
    code: "CIV",
    folder: "civ",
    available: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    slug: "architecture",
    name: "Architecture Engineering",
    code: "ARCH",
    folder: "arch",
    available: [1, 2, 3, 4, 5, 6, 7, 8],
  },
];

export const ordinals = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth"];
export const yearLabels = ["First Year", "Second Year", "Third Year", "Fourth Year"];

export function syllabusFile(department: SyllabusDepartment, semester: number) {
  return department.available.includes(semester)
    ? `/syllabus/${department.folder}/semester-${semester}.pdf`
    : null;
}