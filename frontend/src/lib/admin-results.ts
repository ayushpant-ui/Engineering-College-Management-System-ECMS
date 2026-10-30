export interface Subject {
  id: number;
  code: string;
  name: string;
  semester: number;
  department: string;
  creditHours: number;
  fullMarks: number;
}

export type RowStatus = "NOT_ENTERED" | "DRAFT" | "PUBLISHED";

export interface SheetRow {
  studentId: number;
  registrationNumber: string;
  fullName: string;
  marks: number | null;
  status: RowStatus;
}

export interface Sheet {
  subject: Subject;
  rows: SheetRow[];
}

export interface AuditEntry {
  id: number;
  action: "CREATE" | "UPDATE" | "PUBLISH" | "UNPUBLISH";
  oldMarks: number | null;
  newMarks: number | null;
  reason: string | null;
  adminId: number | null;
  createdAt: string;
  student: { id: number; fullName: string; registrationNumber: string } | null;
}

// Parses what an admin typed into a marks cell
export function parseMarks(raw: string, fullMarks: number): { value: number | null; error?: string } {
  const text = raw.trim();
  if (text === "") return { value: null };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { value: null, error: "Numbers only (max 2 decimals)" };
  const value = Number(text);
  if (value > fullMarks) return { value: null, error: `Max is ${fullMarks}` };
  return { value };
}