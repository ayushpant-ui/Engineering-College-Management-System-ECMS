import { computeCell, DEFAULT_GRADE_SCALE } from "@/lib/result-grading";
import type {
  AuditEntry,
  ComponentDef,
  ExamOverview,
  ExamSummary,
  ExamType,
  GradeBand,
  PublicationStatus,
  SaveMarksEntry,
  StudentExamResult,
  StudentResultsResponse,
  StudentSubjectResult,
  SubjectProgress,
  SubjectSheet,
} from "@/lib/result-types";

/*
 * MOCK DATA LAYER (stored in this browser's localStorage)
 *
 * It behaves like the backend should, so every screen works before the API exists.
 * When the backend is ready, keep these method names and signatures and replace each body
 * with a fetch() call (see RESULT-API.md for the endpoints). The screens don't need to change.
 *
 * To reset the demo data: DevTools → Application → Local Storage → delete "ecms-result-mock-v1".
 */

const KEY = "ecms-result-mock-v1";

export class ResultApiError extends Error {}

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const day = (offset: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString();
};

interface MockSubject {
  id: number;
  code: string;
  name: string;
  semester: number;
  components: ComponentDef[];
}
interface MockStudent {
  id: number;
  registrationNumber: string;
  fullName: string;
  semester: number;
}
interface MockExam {
  id: number;
  name: string;
  semester: number;
  examType: ExamType;
  examPeriod: { id: number; name: string };
  publication: "DRAFT" | "PUBLISHED" | null; // ResultPublication.status (null = no row yet)
  publishedAt: string | null;
}
interface MockEnrollment {
  id: number;
  examId: number;
  studentId: number;
  subjectIds?: number[]; // backlog exams: only the subjects this student re-sits
}
type AuditRecord = AuditEntry & { examId: number; subjectId: number | null };

interface Db {
  gradeScale: GradeBand[];
  subjects: MockSubject[];
  students: MockStudent[];
  exams: MockExam[];
  enrollments: MockEnrollment[];
  marks: Record<string, number>; // `${enrollmentId}:${componentId}` → marks obtained
  audit: AuditRecord[];
  seq: number;
}

const comp = (
  id: number,
  type: ComponentDef["type"],
  creditHours: number,
  fullMarks: number,
  passMarks: number | null
): ComponentDef => ({ id, type, creditHours, fullMarks, passMarks });

// Deterministic sample marks (about one in eleven fails)
const sampleMarks = (enrollmentId: number, def: ComponentDef) => {
  let pct = 0.42 + ((enrollmentId * 31 + def.id * 17) % 55) / 100;
  if ((enrollmentId + def.id) % 11 === 0) pct = 0.3;
  return Math.min(def.fullMarks, Math.round(def.fullMarks * pct * 2) / 2);
};

function seed(): Db {
  const subjects: MockSubject[] = [
    { id: 11, code: "CMP 201", name: "Data Structures & Algorithms", semester: 3, components: [comp(111, "THEORY", 3, 60, 24), comp(112, "PRACTICAL", 1, 40, 16)] },
    { id: 12, code: "CMP 202", name: "Digital Logic", semester: 3, components: [comp(121, "THEORY", 3, 100, 40)] },
    { id: 13, code: "CMP 203", name: "Database Management Systems", semester: 3, components: [comp(131, "THEORY", 3, 60, 24), comp(132, "PRACTICAL", 1, 40, 16)] },
    { id: 14, code: "SH 201", name: "Engineering Mathematics III", semester: 3, components: [comp(141, "THEORY", 3, 100, 40)] },
    { id: 21, code: "CMP 251", name: "Theory of Computation", semester: 4, components: [comp(211, "THEORY", 3, 100, 40)] },
    { id: 22, code: "CMP 252", name: "Computer Networks", semester: 4, components: [comp(221, "THEORY", 3, 60, 24), comp(222, "PRACTICAL", 1, 40, 16)] },
    { id: 23, code: "CMP 253", name: "Microprocessors", semester: 4, components: [comp(231, "THEORY", 3, 60, 24), comp(232, "PRACTICAL", 1, 40, 16)] },
    { id: 24, code: "SH 251", name: "Numerical Methods", semester: 4, components: [comp(241, "THEORY", 3, 100, 40)] },
    { id: 25, code: "CMP 254", name: "Software Engineering", semester: 4, components: [comp(251, "THEORY", 3, 60, 24), comp(252, "PRACTICAL", 1, 40, 16)] },
  ];

  const people: [string, string][] = [
    ["CE-2024-002", "Aarav Joshi"],
    ["CE-2024-003", "Sita Rawal"],
    ["CE-2024-004", "Bikash Thapa"],
    ["CE-2024-005", "Anita Bhatt"],
    ["CE-2024-006", "Prakash Oli"],
    ["CE-2024-007", "Kamal Bista"],
    ["CE-2024-008", "Nisha Pant"],
    ["CE-2024-009", "Rohan Karki"],
  ];
  const students: MockStudent[] = people.map(([registrationNumber, fullName], i) => ({
    id: i + 1,
    registrationNumber,
    fullName,
    semester: 4,
  }));

  const exams: MockExam[] = [
    {
      id: 1,
      name: "Fourth Semester Regular Examination",
      semester: 4,
      examType: "REGULAR",
      examPeriod: { id: 1, name: "2026 Final Examination" },
      publication: null,
      publishedAt: null,
    },
    {
      id: 2,
      name: "Third Semester Regular Examination",
      semester: 3,
      examType: "REGULAR",
      examPeriod: { id: 2, name: "2025 Final Examination" },
      publication: "PUBLISHED",
      publishedAt: day(-60),
    },
    {
      id: 3,
      name: "Third Semester Backlog Examination",
      semester: 3,
      examType: "BACKLOG",
      examPeriod: { id: 3, name: "2026 Backlog Examination" },
      publication: null,
      publishedAt: null,
    },
  ];

  const enrollments: MockEnrollment[] = [];
  let enrollmentId = 0;
  for (const exam of [exams[0], exams[1]]) {
    for (const s of students) enrollments.push({ id: ++enrollmentId, examId: exam.id, studentId: s.id });
  }
  enrollments.push({ id: ++enrollmentId, examId: 3, studentId: 3, subjectIds: [12] });
  enrollments.push({ id: ++enrollmentId, examId: 3, studentId: 6, subjectIds: [11, 13] });

  const marks: Record<string, number> = {};
  const fill = (exam: MockExam, subjectIds: number[], onlyFirst?: number) => {
    const list = enrollments.filter((e) => e.examId === exam.id).slice(0, onlyFirst);
    for (const e of list) {
      for (const subject of subjects.filter((s) => subjectIds.includes(s.id))) {
        for (const def of subject.components) marks[`${e.id}:${def.id}`] = sampleMarks(e.id, def);
      }
    }
  };
  fill(exams[1], [11, 12, 13, 14]); // third semester: complete and published
  fill(exams[0], [21, 22]); // fourth semester: two subjects complete
  fill(exams[0], [23], 4); // one subject half done

  return { gradeScale: DEFAULT_GRADE_SCALE, subjects, students, exams, enrollments, marks, audit: [], seq: 0 };
}

function save(db: Db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage can be blocked or full */
  }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* fall through to a fresh seed */
  }
  const db = seed();
  save(db);
  return db;
}

// ── Lookups ──

const markKey = (enrollmentId: number, componentId: number) => `${enrollmentId}:${componentId}`;

function findExam(db: Db, id: number) {
  const exam = db.exams.find((e) => e.id === id);
  if (!exam) throw new ResultApiError("Exam not found.");
  return exam;
}

function findSubject(db: Db, id: number) {
  const subject = db.subjects.find((s) => s.id === id);
  if (!subject) throw new ResultApiError("Subject not found.");
  return subject;
}

// Students sitting a subject in an exam (the rows that have a Result record)
function rowsFor(db: Db, exam: MockExam, subject: MockSubject) {
  return db.enrollments
    .filter((e) => e.examId === exam.id && (!e.subjectIds || e.subjectIds.includes(subject.id)))
    .map((enrollment) => ({ enrollment, student: db.students.find((s) => s.id === enrollment.studentId)! }))
    .sort((a, b) => a.student.registrationNumber.localeCompare(b.student.registrationNumber));
}

const subjectsFor = (db: Db, exam: MockExam) =>
  db.subjects.filter((s) => s.semester === exam.semester && rowsFor(db, exam, s).length > 0);

const hasAllMarks = (db: Db, enrollmentId: number, subject: MockSubject) =>
  subject.components.every((c) => db.marks[markKey(enrollmentId, c.id)] !== undefined);

function statusOf(db: Db, exam: MockExam): PublicationStatus {
  if (exam.publication) return exam.publication;
  const ids = new Set(db.enrollments.filter((e) => e.examId === exam.id).map((e) => e.id));
  const anyMarks = Object.keys(db.marks).some((k) => ids.has(Number(k.split(":")[0])));
  return anyMarks ? "DRAFT" : "NOT_STARTED";
}

function summarize(db: Db, exam: MockExam): ExamSummary {
  const subjects = subjectsFor(db, exam);
  return {
    id: exam.id,
    name: exam.name,
    semester: exam.semester,
    examType: exam.examType,
    examPeriod: exam.examPeriod,
    enrolledCount: db.enrollments.filter((e) => e.examId === exam.id).length,
    subjectCount: subjects.length,
    completedSubjects: subjects.filter((s) =>
      rowsFor(db, exam, s).every((r) => hasAllMarks(db, r.enrollment.id, s))
    ).length,
    status: statusOf(db, exam),
    publishedAt: exam.publishedAt,
  };
}

function addAudit(db: Db, entry: Omit<AuditRecord, "id" | "createdAt" | "adminId">) {
  db.audit.unshift({ ...entry, id: ++db.seq, createdAt: new Date().toISOString(), adminId: 1 });
}

// ── Admin API ──

export const resultApi = {
  async getGradeScale(): Promise<GradeBand[]> {
    await delay(100);
    return load().gradeScale;
  },

  async listExams(): Promise<ExamSummary[]> {
    await delay();
    const db = load();
    return db.exams.map((e) => summarize(db, e)).sort((a, b) => b.id - a.id);
  },

  async getOverview(examId: number): Promise<ExamOverview> {
    await delay();
    const db = load();
    const exam = findExam(db, examId);

    const subjects: SubjectProgress[] = subjectsFor(db, exam).map((s) => {
      const rows = rowsFor(db, exam, s);
      return {
        id: s.id,
        code: s.code,
        name: s.name,
        components: s.components,
        totalCount: rows.length,
        enteredCount: rows.filter((r) => hasAllMarks(db, r.enrollment.id, s)).length,
      };
    });

    return { exam: summarize(db, exam), subjects };
  },

  async getSubjectSheet(examId: number, subjectId: number): Promise<SubjectSheet> {
    await delay();
    const db = load();
    const exam = findExam(db, examId);
    const subject = findSubject(db, subjectId);

    return {
      exam: summarize(db, exam),
      subject: { id: subject.id, code: subject.code, name: subject.name },
      components: subject.components,
      rows: rowsFor(db, exam, subject).map(({ enrollment, student }) => ({
        enrollmentId: enrollment.id,
        studentId: student.id,
        registrationNumber: student.registrationNumber,
        fullName: student.fullName,
        cells: Object.fromEntries(
          subject.components.map((def) => [
            String(def.id),
            computeCell(def, db.marks[markKey(enrollment.id, def.id)] ?? null, db.gradeScale),
          ])
        ),
      })),
    };
  },

  // The server validates everything again. Once published, any change needs a reason.
  async saveMarks(
    examId: number,
    subjectId: number,
    entries: SaveMarksEntry[],
    reason?: string
  ): Promise<{ saved: number }> {
    await delay(350);
    const db = load();
    const exam = findExam(db, examId);
    const subject = findSubject(db, subjectId);
    const published = statusOf(db, exam) === "PUBLISHED";

    const rows = rowsFor(db, exam, subject);
    const allowed = new Set(rows.map((r) => r.enrollment.id));
    const defs = new Map(subject.components.map((c) => [c.id, c]));

    const changes: { entry: SaveMarksEntry; def: ComponentDef; previous: number | null }[] = [];
    for (const entry of entries) {
      const def = defs.get(entry.componentId);
      if (!def || !allowed.has(entry.enrollmentId)) throw new ResultApiError("Unknown student or component.");
      if (entry.marks !== null && (entry.marks < 0 || entry.marks > def.fullMarks)) {
        throw new ResultApiError(`Marks must be between 0 and ${def.fullMarks}.`);
      }
      const previous = db.marks[markKey(entry.enrollmentId, entry.componentId)] ?? null;
      if (previous === entry.marks) continue;
      if (published && entry.marks === null) {
        throw new ResultApiError("Published marks can't be cleared. Unpublish the exam first.");
      }
      changes.push({ entry, def, previous });
    }
    if (changes.length === 0) return { saved: 0 };

    if (published && (!reason || reason.trim().length < 3)) {
      throw new ResultApiError("A reason is required when changing published results.");
    }

    for (const { entry, def, previous } of changes) {
      const key = markKey(entry.enrollmentId, entry.componentId);
      if (entry.marks === null) delete db.marks[key];
      else db.marks[key] = entry.marks;

      const enrollment = db.enrollments.find((e) => e.id === entry.enrollmentId)!;
      const student = db.students.find((s) => s.id === enrollment.studentId)!;
      addAudit(db, {
        examId,
        subjectId,
        action: previous === null ? "CREATE" : "UPDATE",
        subject: { code: subject.code, name: subject.name },
        student: { registrationNumber: student.registrationNumber, fullName: student.fullName },
        componentType: def.type,
        oldMarks: previous,
        newMarks: entry.marks,
        reason: published ? reason!.trim() : null,
      });
    }

    save(db);
    return { saved: changes.length };
  },

  // Publishing is per EXAM (one ResultPublication row), not per subject
  async publish(examId: number): Promise<{ publishedStudents: number }> {
    await delay(500);
    const db = load();
    const exam = findExam(db, examId);
    const status = statusOf(db, exam);

    if (status === "PUBLISHED") throw new ResultApiError("This exam is already published.");
    if (status === "NOT_STARTED") throw new ResultApiError("Enter some marks before publishing.");

    exam.publication = "PUBLISHED";
    exam.publishedAt = new Date().toISOString();
    addAudit(db, {
      examId,
      subjectId: null,
      action: "PUBLISH",
      subject: null,
      student: null,
      componentType: null,
      oldMarks: null,
      newMarks: null,
      reason: null,
    });
    // The real backend also records which result counts for GPA (StudentSubjectRecord, action RECOGNIZE)
    save(db);
    return { publishedStudents: db.enrollments.filter((e) => e.examId === examId).length };
  },

  async unpublish(examId: number, reason: string): Promise<void> {
    await delay(400);
    const db = load();
    const exam = findExam(db, examId);

    if (statusOf(db, exam) !== "PUBLISHED") throw new ResultApiError("This exam isn't published.");
    if (reason.trim().length < 3) throw new ResultApiError("Please give a reason for unpublishing.");

    exam.publication = "DRAFT";
    exam.publishedAt = null;
    addAudit(db, {
      examId,
      subjectId: null,
      action: "UNPUBLISH",
      subject: null,
      student: null,
      componentType: null,
      oldMarks: null,
      newMarks: null,
      reason: reason.trim(),
    });
    save(db);
  },

  async listAudit(examId: number, subjectId?: number, limit = 100): Promise<AuditEntry[]> {
    await delay();
    return load()
      .audit.filter((a) => a.examId === examId && (!subjectId || a.subjectId === subjectId || a.subjectId === null))
      .slice(0, limit)
      .map(({ examId: _e, subjectId: _s, ...entry }) => entry);
  },

  // ── Student API ──

  // Gives the logged-in student some demo enrollments so the screens have data
  async getMyResults(me: {
    registrationNumber: string;
    fullName: string;
    semester: number;
  }): Promise<StudentResultsResponse> {
    await delay();
    const db = load();

    let student = db.students.find((s) => s.registrationNumber === me.registrationNumber);
    if (!student) {
      student = {
        id: Math.max(0, ...db.students.map((s) => s.id)) + 1,
        registrationNumber: me.registrationNumber,
        fullName: me.fullName,
        semester: me.semester,
      };
      db.students.push(student);
    }
    for (const exam of db.exams.filter((e) => e.id === 1 || e.id === 2)) {
      if (db.enrollments.some((e) => e.examId === exam.id && e.studentId === student!.id)) continue;
      const enrollment: MockEnrollment = {
        id: Math.max(0, ...db.enrollments.map((e) => e.id)) + 1,
        examId: exam.id,
        studentId: student.id,
      };
      db.enrollments.push(enrollment);
      if (exam.id === 2) {
        for (const subject of db.subjects.filter((s) => s.semester === 3)) {
          for (const def of subject.components) db.marks[markKey(enrollment.id, def.id)] = sampleMarks(enrollment.id, def);
        }
      }
    }
    save(db);

    const mine = db.exams
      .filter((e) => e.publication === "PUBLISHED")
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

    const recognizedSubjects = new Set<number>(); // newest published result of each subject counts for CGPA
    let cgpaPoints = 0;
    let cgpaCredits = 0;
    const exams: StudentExamResult[] = [];

    for (const exam of mine) {
      const enrollment = db.enrollments.find((e) => e.examId === exam.id && e.studentId === student!.id);
      if (!enrollment) continue;

      const subjects: StudentSubjectResult[] = [];
      for (const subject of subjectsFor(db, exam)) {
        const sits = rowsFor(db, exam, subject).some((r) => r.enrollment.id === enrollment.id);
        if (!sits || !hasAllMarks(db, enrollment.id, subject)) continue;

        const components = subject.components.map((def) => {
          const cell = computeCell(def, db.marks[markKey(enrollment.id, def.id)], db.gradeScale);
          return {
            type: def.type,
            creditHours: def.creditHours,
            fullMarks: def.fullMarks,
            passMarks: def.passMarks,
            marksObtained: cell.marks as number,
            grade: cell.grade as string,
            gradeValue: cell.gradeValue as number,
          };
        });
        const creditHours = components.reduce((s, c) => s + c.creditHours, 0);
        const gradePoint = components.reduce((s, c) => s + c.gradeValue * c.creditHours, 0);
        const recognized = !recognizedSubjects.has(subject.id);

        if (recognized) {
          recognizedSubjects.add(subject.id);
          cgpaPoints += gradePoint;
          cgpaCredits += creditHours;
        }

        subjects.push({
          subjectId: subject.id,
          code: subject.code,
          name: subject.name,
          components,
          creditHours,
          gradePoint,
          gradeValue: creditHours > 0 ? gradePoint / creditHours : 0,
          passed: components.every((c) => c.gradeValue > 0),
          recognized,
        });
      }

      const credits = subjects.reduce((s, x) => s + x.creditHours, 0);
      exams.push({
        examId: exam.id,
        examName: exam.name,
        semester: exam.semester,
        examType: exam.examType,
        examPeriod: exam.examPeriod.name,
        publishedAt: exam.publishedAt as string,
        subjects,
        sgpa: credits > 0 ? subjects.reduce((s, x) => s + x.gradePoint, 0) / credits : 0,
        passedAll: subjects.every((s) => s.passed),
      });
    }

    return { exams, cgpa: cgpaCredits > 0 ? cgpaPoints / cgpaCredits : null };
  },
};