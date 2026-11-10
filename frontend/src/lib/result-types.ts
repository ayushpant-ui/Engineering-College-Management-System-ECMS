
//   Exam / ExamPeriod / ExamEnrollment / Result / ResultComponent
//   CurriculumSubjectComponent (credit hours, full marks, pass marks)
//   ResultPublication (DRAFT / PUBLISHED, one per exam) / ResultAudit / GradeScale

export type ExamType = "REGULAR" | "BACKLOG";
export type ComponentType = "THEORY" | "PRACTICAL";
export type ResultAction = "CREATE" | "UPDATE" | "PUBLISH" | "UNPUBLISH" | "RECOGNIZE";

// NOT_STARTED = no marks entered yet (no ResultPublication row)
export type PublicationStatus = "NOT_STARTED" | "DRAFT" | "PUBLISHED";

export interface GradeBand {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradeValue: number;
}

// ── Admin ──

export interface ExamSummary {
  id: number;
  name: string;
  semester: number;
  examType: ExamType;
  examPeriod: { id: number; name: string };
  enrolledCount: number;
  subjectCount: number;
  completedSubjects: number; // subjects where every student has every component entered
  status: PublicationStatus;
  publishedAt: string | null;
}

// One theory or practical part of a subject (a CurriculumSubjectComponent)
export interface ComponentDef {
  id: number;
  type: ComponentType;
  creditHours: number;
  fullMarks: number;
  passMarks: number | null;
}

export interface SubjectProgress {
  id: number;
  code: string;
  name: string;
  components: ComponentDef[];
  enteredCount: number; // students with all components entered
  totalCount: number; // students sitting this subject
}

export interface ExamOverview {
  exam: ExamSummary;
  subjects: SubjectProgress[];
}

export interface MarkCell {
  marks: number | null;
  grade: string | null;
  gradeValue: number | null;
}

export interface SheetRow {
  enrollmentId: number;
  studentId: number;
  registrationNumber: string;
  fullName: string;
  cells: Record<string, MarkCell>; // key = ComponentDef.id
}

export interface SubjectSheet {
  exam: ExamSummary;
  subject: { id: number; code: string; name: string };
  components: ComponentDef[];
  rows: SheetRow[];
}

export interface SaveMarksEntry {
  enrollmentId: number;
  componentId: number;
  marks: number | null;
}

export interface AuditEntry {
  id: number;
  action: ResultAction;
  subject: { code: string; name: string } | null;
  student: { registrationNumber: string; fullName: string } | null;
  componentType: ComponentType | null;
  oldMarks: number | null;
  newMarks: number | null;
  reason: string | null;
  adminId: number | null;
  createdAt: string;
}

// ── Student ──

export interface StudentComponentResult {
  type: ComponentType;
  creditHours: number;
  fullMarks: number;
  passMarks: number | null;
  marksObtained: number;
  grade: string;
  gradeValue: number;
}

export interface StudentSubjectResult {
  subjectId: number;
  code: string;
  name: string;
  components: StudentComponentResult[];
  creditHours: number;
  gradePoint: number;
  gradeValue: number; // gradePoint / creditHours
  passed: boolean;
  recognized: boolean; // this is the result counted for CGPA (StudentSubjectRecord)
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