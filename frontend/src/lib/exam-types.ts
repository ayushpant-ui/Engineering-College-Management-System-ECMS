export interface ExamSubject {
  id: string;
  code: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM - 1:00 PM"
}

export interface Exam {
  id: string;
  name: string;
  semester: number;
  fee: number; // regular exam fee, in rupees
  backPaperFee: number; // extra fee per back paper
  formOpensAt: string; // YYYY-MM-DD
  formClosesAt: string; // YYYY-MM-DD (inclusive)
  examStartsAt: string; // YYYY-MM-DD
  center: string;
  subjects: ExamSubject[];
  admitCardsReleased: boolean;
}

export type ExamInput = Omit<Exam, "id" | "admitCardsReleased" | "subjects"> & {
  subjects: Omit<ExamSubject, "id">[];
};

export type ExamFormStatus = "SUBMITTED" | "APPROVED" | "REJECTED";
export type PaymentStatus = "UNPAID" | "PAID";

export interface BackPaper {
  code: string;
  name: string;
}

export interface ExamForm {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  department: string;
  semester: number;
  phone: string;
  backPapers: BackPaper[];
  fee: number;
  status: ExamFormStatus;
  paymentStatus: PaymentStatus;
  remark?: string; // reason shown to the student when a form is rejected
  symbolNumber?: string; // assigned when the form is approved
  submittedAt: string; // ISO date-time
  reviewedAt?: string;
}

export interface StudentInfo {
  id: string;
  fullName: string;
  registrationNumber: string;
  department: string;
  semester: number;
  photoUrl?: string | null;
}

export interface SubmitFormInput {
  phone: string;
  backPapers: BackPaper[];
}

// ── Rules shared by the student and admin screens ──

export type FormWindow = "UPCOMING" | "OPEN" | "CLOSED";

const startOfDay = (date: string) => new Date(`${date}T00:00:00Z`).getTime();
const endOfDay = (date: string) => new Date(`${date}T23:59:59Z`).getTime();

export function getFormWindow(exam: Pick<Exam, "formOpensAt" | "formClosesAt">, now = Date.now()): FormWindow {
  if (now < startOfDay(exam.formOpensAt)) return "UPCOMING";
  if (now > endOfDay(exam.formClosesAt)) return "CLOSED";
  return "OPEN";
}

export const calculateFee = (exam: Pick<Exam, "fee" | "backPaperFee">, backPaperCount: number) =>
  exam.fee + backPaperCount * exam.backPaperFee;

export type AdmitCardState =
  | { available: true }
  | { available: false; reason: string; action?: "FORM" | "PAY" };

// One function decides whether a student may see their admit card, and why not.
export function getAdmitCardState(exam: Exam, form: ExamForm | null): AdmitCardState {
  if (!form) {
    return { available: false, reason: "You haven't submitted the exam form for this exam.", action: "FORM" };
  }
  if (form.status === "REJECTED") {
    return { available: false, reason: `Your exam form was rejected${form.remark ? `: ${form.remark}` : "."}` };
  }
  if (form.status === "SUBMITTED") {
    return { available: false, reason: "Your exam form is waiting for approval." };
  }
  if (form.paymentStatus !== "PAID") {
    return { available: false, reason: "The exam fee hasn't been paid yet.", action: "PAY" };
  }
  if (!exam.admitCardsReleased) {
    return { available: false, reason: "Admit cards haven't been released yet. Please check back later." };
  }
  return { available: true };
}