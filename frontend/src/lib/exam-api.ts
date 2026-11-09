import {
  calculateFee,
  getFormWindow,
  type BackPaper,
  type Exam,
  type ExamForm,
  type ExamFormStatus,
  type ExamInput,
  type StudentInfo,
  type SubmitFormInput,
} from "@/lib/exam-types";

/*
 * MOCK DATA LAYER
 * Everything here is stored in this browser's localStorage so the whole flow can be demoed
 * (a student submits a form, an admin approves it, the student sees the admit card).
 *
 * When your backend is ready, keep the `examApi` method names and signatures and replace each
 * body with a fetch() call. Nothing in the screens needs to change.
 * To reset the demo data, delete the "ecms-exam-mock-v1" key in DevTools → Application → Local Storage.
 */

const KEY = "ecms-exam-mock-v1";
const CENTER = "School of Engineering, Far Western University, Kanchanpur";
const TIME = "10:00 AM - 1:00 PM";

interface Db {
  exams: Exam[];
  forms: ExamForm[];
}

export class ExamApiError extends Error {}

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const day = (offset: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

// Subjects from earlier semesters a student may have failed
const BACK_PAPER_POOL: (BackPaper & { semester: number })[] = [
  { code: "SH 101", name: "Engineering Mathematics I", semester: 1 },
  { code: "SH 102", name: "Engineering Physics", semester: 1 },
  { code: "CMP 101", name: "Programming in C", semester: 1 },
  { code: "SH 151", name: "Engineering Mathematics II", semester: 2 },
  { code: "SH 152", name: "Engineering Chemistry", semester: 2 },
  { code: "EE 151", name: "Basic Electrical Engineering", semester: 2 },
  { code: "SH 201", name: "Engineering Mathematics III", semester: 3 },
  { code: "CMP 202", name: "Digital Logic", semester: 3 },
  { code: "CMP 203", name: "Database Management Systems", semester: 3 },
  { code: "CMP 251", name: "Theory of Computation", semester: 4 },
  { code: "CMP 252", name: "Computer Networks", semester: 4 },
];

function seed(): Db {
  const finalSubjects = [
    { id: "s1", code: "CMP 251", name: "Theory of Computation", date: day(25), time: TIME },
    { id: "s2", code: "CMP 252", name: "Computer Networks", date: day(27), time: TIME },
    { id: "s3", code: "CMP 253", name: "Microprocessors", date: day(29), time: TIME },
    { id: "s4", code: "SH 251", name: "Numerical Methods", date: day(31), time: TIME },
    { id: "s5", code: "CMP 254", name: "Software Engineering", date: day(33), time: TIME },
  ];

  const exams: Exam[] = [
    {
      id: "exam-4-final",
      name: "Fourth Semester Final Examination 2026",
      semester: 4,
      fee: 1500,
      backPaperFee: 500,
      formOpensAt: day(-5),
      formClosesAt: day(10),
      examStartsAt: day(25),
      center: CENTER,
      subjects: finalSubjects,
      admitCardsReleased: false,
    },
    {
      id: "exam-4-mid",
      name: "Fourth Semester Mid-Term Examination 2026",
      semester: 4,
      fee: 800,
      backPaperFee: 300,
      formOpensAt: day(-50),
      formClosesAt: day(-40),
      examStartsAt: day(-30),
      center: CENTER,
      subjects: [
        { id: "m1", code: "CMP 251", name: "Theory of Computation", date: day(-30), time: TIME },
        { id: "m2", code: "CMP 252", name: "Computer Networks", date: day(-28), time: TIME },
      ],
      admitCardsReleased: true,
    },
    {
      id: "exam-5-final",
      name: "Fifth Semester Final Examination 2026",
      semester: 5,
      fee: 1500,
      backPaperFee: 500,
      formOpensAt: day(20),
      formClosesAt: day(35),
      examStartsAt: day(50),
      center: CENTER,
      subjects: [
        { id: "f1", code: "CMP 301", name: "Operating Systems", date: day(50), time: TIME },
        { id: "f2", code: "CMP 302", name: "Computer Graphics", date: day(52), time: TIME },
      ],
      admitCardsReleased: false,
    },
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

  const make = (
    examId: string,
    i: number,
    status: ExamFormStatus,
    paid: boolean,
    extra: Partial<ExamForm> = {}
  ): ExamForm => ({
    id: `${examId}-f${i}`,
    examId,
    studentId: `mock-${i}`,
    studentName: people[i][1],
    registrationNumber: people[i][0],
    department: "Computer Engineering",
    semester: 4,
    phone: `9841${String(100000 + i * 7919).slice(-6)}`,
    backPapers: [],
    fee: 1500,
    status,
    paymentStatus: paid ? "PAID" : "UNPAID",
    submittedAt: new Date().toISOString(),
    ...(status !== "SUBMITTED" ? { reviewedAt: new Date().toISOString() } : {}),
    ...extra,
  });

  const forms: ExamForm[] = [
    make("exam-4-final", 0, "SUBMITTED", false),
    make("exam-4-final", 1, "SUBMITTED", true),
    make("exam-4-final", 2, "SUBMITTED", false),
    make("exam-4-final", 3, "APPROVED", true, {
      symbolNumber: "SYM-2026-0001",
      backPapers: [{ code: "SH 152", name: "Engineering Chemistry" }],
      fee: 2000,
    }),
    make("exam-4-final", 4, "APPROVED", true, { symbolNumber: "SYM-2026-0002" }),
    make("exam-4-final", 5, "APPROVED", false, { symbolNumber: "SYM-2026-0003" }),
    make("exam-4-final", 6, "REJECTED", false, { remark: "Registration number doesn't match college records." }),
    make("exam-4-mid", 7, "APPROVED", true, { symbolNumber: "SYM-2026-1001", fee: 800 }),
    make("exam-4-mid", 4, "APPROVED", true, { symbolNumber: "SYM-2026-1002", fee: 800 }),
  ];

  return { exams, forms };
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

function nextSymbol(db: Db, exam: Exam) {
  const count = db.forms.filter((f) => f.examId === exam.id && f.symbolNumber).length + 1;
  return `SYM-${exam.examStartsAt.slice(0, 4)}-${String(count).padStart(4, "0")}`;
}

function findExam(db: Db, id: string) {
  const exam = db.exams.find((e) => e.id === id);
  if (!exam) throw new ExamApiError("Exam not found.");
  return exam;
}

function findForm(db: Db, id: string) {
  const form = db.forms.find((f) => f.id === id);
  if (!form) throw new ExamApiError("Exam form not found.");
  return form;
}

export const examApi = {
  // ── Exams (admin creates, students read) ──

  async listExams(): Promise<Exam[]> {
    await delay();
    return [...load().exams].sort((a, b) => b.examStartsAt.localeCompare(a.examStartsAt));
  },

  async getExam(id: string): Promise<Exam> {
    await delay(150);
    return findExam(load(), id);
  },

  async saveExam(input: ExamInput, id?: string): Promise<Exam> {
    await delay();
    const db = load();
    const subjects = input.subjects.map((s) => ({ ...s, id: uid() }));

    if (id) {
      const exam = findExam(db, id);
      Object.assign(exam, input, { subjects });
      save(db);
      return exam;
    }

    const exam: Exam = { ...input, subjects, id: `exam-${uid()}`, admitCardsReleased: false };
    db.exams.push(exam);
    save(db);
    return exam;
  },

  async deleteExam(id: string): Promise<void> {
    await delay();
    const db = load();
    findExam(db, id);
    if (db.forms.some((f) => f.examId === id)) {
      throw new ExamApiError("This exam already has submitted forms, so it can't be deleted.");
    }
    db.exams = db.exams.filter((e) => e.id !== id);
    save(db);
  },

  async setAdmitCardsReleased(id: string, released: boolean): Promise<Exam> {
    await delay();
    const db = load();
    const exam = findExam(db, id);
    exam.admitCardsReleased = released;
    save(db);
    return exam;
  },

  async getBackPaperOptions(exam: Exam): Promise<BackPaper[]> {
    await delay(100);
    return BACK_PAPER_POOL.filter((s) => s.semester < exam.semester).map(({ code, name }) => ({ code, name }));
  },

  // ── A student's own forms ──

  async listMyForms(studentId: string): Promise<ExamForm[]> {
    await delay(150);
    return load().forms.filter((f) => f.studentId === studentId);
  },

  async getMyForm(examId: string, studentId: string): Promise<ExamForm | null> {
    await delay(150);
    return load().forms.find((f) => f.examId === examId && f.studentId === studentId) ?? null;
  },

  async submitForm(exam: Exam, student: StudentInfo, input: SubmitFormInput): Promise<ExamForm> {
    await delay(400);
    const db = load();

    if (getFormWindow(exam) !== "OPEN") throw new ExamApiError("The exam form isn't open right now.");
    if (db.forms.some((f) => f.examId === exam.id && f.studentId === student.id)) {
      throw new ExamApiError("You have already submitted the form for this exam.");
    }

    const form: ExamForm = {
      id: `${exam.id}-${uid()}`,
      examId: exam.id,
      studentId: student.id,
      studentName: student.fullName,
      registrationNumber: student.registrationNumber,
      department: student.department,
      semester: student.semester,
      phone: input.phone,
      backPapers: input.backPapers,
      fee: calculateFee(exam, input.backPapers.length), // the server decides the fee, never the browser
      status: "SUBMITTED",
      paymentStatus: "UNPAID",
      submittedAt: new Date().toISOString(),
    };
    db.forms.push(form);
    save(db);
    return form;
  },

  // DEMO ONLY: marks the form paid. The real version starts an eSewa payment and is confirmed by the server.
  async payForm(formId: string): Promise<ExamForm> {
    await delay(900);
    const db = load();
    const form = findForm(db, formId);
    form.paymentStatus = "PAID";
    save(db);
    return form;
  },

  // ── Admin: reviewing forms ──

  async listExamForms(examId: string): Promise<ExamForm[]> {
    await delay();
    return load()
      .forms.filter((f) => f.examId === examId)
      .sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
  },

  async reviewForm(formId: string, decision: "APPROVED" | "REJECTED", remark?: string): Promise<ExamForm> {
    await delay();
    const db = load();
    const form = findForm(db, formId);

    if (decision === "REJECTED" && !remark?.trim()) {
      throw new ExamApiError("A remark is required when rejecting a form.");
    }

    form.status = decision;
    form.remark = decision === "REJECTED" ? remark!.trim() : undefined;
    form.reviewedAt = new Date().toISOString();
    if (decision === "APPROVED" && !form.symbolNumber) {
      form.symbolNumber = nextSymbol(db, findExam(db, form.examId));
    }
    save(db);
    return form;
  },

  async approveMany(formIds: string[]): Promise<number> {
    await delay(400);
    const db = load();
    let approved = 0;
    for (const id of formIds) {
      const form = db.forms.find((f) => f.id === id);
      if (!form || form.status !== "SUBMITTED") continue;
      form.status = "APPROVED";
      form.remark = undefined;
      form.reviewedAt = new Date().toISOString();
      if (!form.symbolNumber) form.symbolNumber = nextSymbol(db, findExam(db, form.examId));
      approved += 1;
    }
    save(db);
    return approved;
  },

  // Cash or bank payment recorded by the accounts office
  async markPaid(formId: string, reason: string): Promise<ExamForm> {
    await delay();
    if (!reason.trim()) throw new ExamApiError("A note is required, e.g. the receipt number.");
    const db = load();
    const form = findForm(db, formId);
    form.paymentStatus = "PAID";
    save(db);
    return form;
  },
};