import { clearSession } from "@/lib/auth-session";

// ── Types ─

export interface SubjectResult {
  code: string;
  name: string;
  creditHours: number;
  marksObtained: number;
  fullMarks: number;
}

export interface SemesterResult {
  semester: number;
  subjects: SubjectResult[];
}

// ── Grading rules

export const PASS_PERCENT = 40;

const gradeScale = [
  { min: 90, grade: "A+", point: 4.0 },
  { min: 80, grade: "A", point: 3.6 },
  { min: 70, grade: "B+", point: 3.2 },
  { min: 60, grade: "B", point: 2.8 },
  { min: 50, grade: "C+", point: 2.4 },
  { min: PASS_PERCENT, grade: "C", point: 2.0 },
  { min: 0, grade: "F", point: 0 },
];

export function getPercent(s: SubjectResult) {
  return s.fullMarks > 0 ? (s.marksObtained / s.fullMarks) * 100 : 0;
}

export function getGrade(s: SubjectResult) {
  const percent = getPercent(s);
  return gradeScale.find((g) => percent >= g.min) ?? gradeScale[gradeScale.length - 1];
}

export function isPassed(s: SubjectResult) {
  return getPercent(s) >= PASS_PERCENT;
}

// Weighted GPA = Σ(gradePoint × creditHours) / Σ(creditHours)
export function calculateGpa(subjects: SubjectResult[]) {
  const credits = subjects.reduce((sum, s) => sum + s.creditHours, 0);
  if (credits === 0) return 0;
  const points = subjects.reduce((sum, s) => sum + getGrade(s).point * s.creditHours, 0);
  return points / credits;
}

export function calculateSummary(subjects: SubjectResult[]) {
  const obtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const full = subjects.reduce((sum, s) => sum + s.fullMarks, 0);
  return {
    gpa: calculateGpa(subjects),
    credits: subjects.reduce((sum, s) => sum + s.creditHours, 0),
    percentage: full > 0 ? (obtained / full) * 100 : 0,
    passed: subjects.length > 0 && subjects.every(isPassed),
    backlogs: subjects.filter((s) => !isPassed(s)).length,
  };
}

// ── Data source ──────────────────────────────────────────────

// Set to false once your backend endpoint is ready.
const USE_MOCK_DATA = true;

const mockResults: SemesterResult[] = [
  {
    semester: 1,
    subjects: [
      { code: "SH 101", name: "Engineering Mathematics I", creditHours: 4, marksObtained: 78, fullMarks: 100 },
      { code: "SH 102", name: "Engineering Physics", creditHours: 3, marksObtained: 71, fullMarks: 100 },
      { code: "CMP 101", name: "Programming in C", creditHours: 4, marksObtained: 86, fullMarks: 100 },
      { code: "ME 101", name: "Engineering Drawing", creditHours: 3, marksObtained: 66, fullMarks: 100 },
    ],
  },
  {
    semester: 2,
    subjects: [
      { code: "SH 151", name: "Engineering Mathematics II", creditHours: 4, marksObtained: 74, fullMarks: 100 },
      { code: "EE 151", name: "Basic Electrical Engineering", creditHours: 3, marksObtained: 82, fullMarks: 100 },
      { code: "CMP 151", name: "Object Oriented Programming", creditHours: 4, marksObtained: 91, fullMarks: 100 },
      { code: "SH 152", name: "Engineering Chemistry", creditHours: 3, marksObtained: 38, fullMarks: 100 },
    ],
  },
  {
    semester: 3,
    subjects: [
      { code: "SH 201", name: "Engineering Mathematics III", creditHours: 4, marksObtained: 69, fullMarks: 100 },
      { code: "CMP 201", name: "Data Structures & Algorithms", creditHours: 4, marksObtained: 88, fullMarks: 100 },
      { code: "CMP 202", name: "Digital Logic", creditHours: 3, marksObtained: 75, fullMarks: 100 },
      { code: "CMP 203", name: "Database Management Systems", creditHours: 3, marksObtained: 80, fullMarks: 100 },
    ],
  },
];

export class UnauthorizedError extends Error {}

function getToken() {
  return localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
}

export async function fetchResults(): Promise<SemesterResult[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 400)); // simulate network
    return mockResults;
  }

  const token = getToken();
  if (!token) throw new UnauthorizedError();

  let response: Response;
  try {
    // Adjust the path to match your backend route.
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/results`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  if (response.status === 401) {
    clearSession();
    throw new UnauthorizedError();
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new Error(message || "Could not load results.");
  }

  // Accepts { data: { semesters } }, { semesters }, or a plain array.
  // If backend uses different field names, map them to SemesterResult here.
  const data = body.data ?? body;
  return (data.semesters ?? data) as SemesterResult[];
}