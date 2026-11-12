// Grade-based results (the college records grades, not marks).
// Shapes follow the Prisma schema: Exam / ExamPeriod / ExamEnrollment / Result / ResultComponent,
// CurriculumSubjectComponent (credit hours), ResultPublication (one per exam), ResultAudit, GradeScale.

export type ExamType = "REGULAR" | "BACKLOG";
export type ComponentType = "THEORY" | "PRACTICAL";
export type ResultAction = "CREATE" | "UPDATE" | "PUBLISH" | "UNPUBLISH" | "RECOGNIZE";

// NOT_STARTED = nothing entered yet (no ResultPublication row)
export type PublicationStatus = "NOT_STARTED" | "DRAFT" | "PUBLISHED";

// One row of the GradeScale table, e.g. { grade: "A", gradeValue: 3.6 }
export interface GradeBand {
  grade: string;
  gradeValue: number;
  minPercentage?: number; // not used by these screens
  maxPercentage?: number;
}

// ── Admin ──

export interface ExamPeriod {
  id: number;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export interface ExamSummary {
  id: number;
  name: string;
  semester: number;
  examType: ExamType;
  examPeriod: { id: number; name: string };
  enrolledCount: number;
  subjectCount: number;
  completedSubjects: number; // subjects where every student has a FINAL grade
  status: PublicationStatus;
  publishedAt: string | null;
}

// A theory or practical part of a subject (a CurriculumSubjectComponent)
export interface ComponentDef {
  id: number;
  type: ComponentType;
  creditHours: number;
}

export interface SubjectProgress {
  id: number;
  code: string;
  name: string;
  components: ComponentDef[];
  enteredCount: number; // students with a final grade
  totalCount: number; // students sitting this subject
}

export interface ExamOverview {
  exam: ExamSummary;
  subjects: SubjectProgress[];
}

export interface SheetRow {
  enrollmentId: number;
  studentId: number;
  registrationNumber: string;
  fullName: string;
  componentGrades: Record<string, string | null>; // key = ComponentDef.id
  finalGrade: string | null; // entered by the admin; this is what counts for GPA
}

export interface SubjectSheet {
  exam: ExamSummary;
  subject: { id: number; code: string; name: string };
  components: ComponentDef[];
  rows: SheetRow[];
}

// Only the fields that changed are sent. null clears a grade.
export interface SaveGradesEntry {
  enrollmentId: number;
  finalGrade?: string | null;
  componentGrades?: Record<string, string | null>; // key = ComponentDef.id
}

export type GradeField = "FINAL" | ComponentType;

export interface AuditEntry {
  id: number;
  action: ResultAction;
  subject: { code: string; name: string } | null;
  student: { registrationNumber: string; fullName: string } | null;
  field: GradeField | null;
  oldGrade: string | null;
  newGrade: string | null;
  reason: string | null;
  adminId: number | null;
  createdAt: string;
}

// ── Student ──

export interface StudentComponentResult {
  type: ComponentType;
  grade: string | null;
}

export interface StudentSubjectResult {
  subjectId: number;
  code: string;
  name: string;
  components: StudentComponentResult[];
  finalGrade: string;
  gradeValue: number;
  creditHours: number;
  gradePoint: number; // gradeValue x creditHours
  passed: boolean;
  recognized: boolean; // this result is the one counted for CGPA (StudentSubjectRecord)
}

export interface StudentExamResult {
  examId: number;
  examName: string;
  semester: number;
  examType: ExamType;
  examPeriod: string;
  publishedAt: string;
  subjects: StudentSubjectResult[];
  sgpa: number;
  passedAll: boolean;
}

export interface StudentResultsResponse {
  exams: StudentExamResult[];
  cgpa: number | null;
}