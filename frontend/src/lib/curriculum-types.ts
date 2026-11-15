// Shapes follow the Prisma models:
//   Department, Curriculum, Subject, SubjectComponent (THEORY / PRACTICAL),
//   CurriculumSubject (a subject placed in a semester), CurriculumSubjectComponent (credit hours)

export type ComponentType = "THEORY" | "PRACTICAL";

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const COMPONENT_TYPES: ComponentType[] = ["THEORY", "PRACTICAL"];
export const componentLabel: Record<ComponentType, string> = { THEORY: "Theory", PRACTICAL: "Practical" };

export interface Department {
  id: number;
  code: string;
  name: string;
}

// ── Subjects (the catalogue) ──

export interface Subject {
  id: number;
  code: string;
  name: string;
  components: ComponentType[]; // SubjectComponent rows: which parts this subject has
  curriculaCount: number; // how many curricula use it
}

export interface SubjectInput {
  code: string;
  name: string;
  components: ComponentType[];
}

// ── Curricula ──

export interface Curriculum {
  id: number;
  name: string;
  version: string;
  department: Department;
  subjectCount: number;
  semesters: number[]; // semesters that have at least one subject
  totalCredits: number;
}

export interface CurriculumInput {
  name: string;
  version: string;
  departmentId: number;
}

// CurriculumSubjectComponent
export interface CurriculumComponent {
  type: ComponentType;
  creditHours: number;
}

// CurriculumSubject
export interface CurriculumSubject {
  id: number;
  semester: number;
  subject: { id: number; code: string; name: string; components: ComponentType[] };
  components: CurriculumComponent[];
  creditHours: number; // sum of the component credit hours
}

export interface CurriculumDetail {
  curriculum: Curriculum;
  items: CurriculumSubject[];
}

export interface CurriculumSubjectInput {
  subjectId: number;
  semester: number;
  components: CurriculumComponent[];
}