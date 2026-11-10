import type {
  ComponentDef,
  GradeBand,
  MarkCell,
  SaveMarksEntry,
  SheetRow,
  SubjectSheet,
} from "@/lib/result-types";

// Only used by the mock. The real scale comes from GET /admin/results/grade-scale (the GradeScale table).
export const DEFAULT_GRADE_SCALE: GradeBand[] = [
  { grade: "A+", minPercentage: 90, maxPercentage: 100, gradeValue: 4.0 },
  { grade: "A", minPercentage: 80, maxPercentage: 90, gradeValue: 3.6 },
  { grade: "B+", minPercentage: 70, maxPercentage: 80, gradeValue: 3.2 },
  { grade: "B", minPercentage: 60, maxPercentage: 70, gradeValue: 2.8 },
  { grade: "C+", minPercentage: 50, maxPercentage: 60, gradeValue: 2.4 },
  { grade: "C", minPercentage: 40, maxPercentage: 50, gradeValue: 2.0 },
  { grade: "F", minPercentage: 0, maxPercentage: 40, gradeValue: 0 },
];

const byMinDesc = (scale: GradeBand[]) => [...scale].sort((a, b) => b.minPercentage - a.minPercentage);

export function bandFor(scale: GradeBand[], percentage: number): GradeBand {
  const sorted = byMinDesc(scale);
  return sorted.find((b) => percentage >= b.minPercentage) ?? sorted[sorted.length - 1];
}

// The lowest band (normally "F")
export const failBand = (scale: GradeBand[]) => byMinDesc(scale)[byMinDesc(scale).length - 1];

/**
 * Grade for one component. Marks below the component's pass marks are always the failing grade.
 * This is a PREVIEW while the admin types: the server calculates and stores the real values.
 */
export function computeCell(def: ComponentDef, marks: number | null, scale: GradeBand[]): MarkCell {
  if (marks === null || scale.length === 0) return { marks, grade: null, gradeValue: null };
  const failed = def.passMarks !== null && marks < def.passMarks;
  const band = failed ? failBand(scale) : bandFor(scale, (marks / def.fullMarks) * 100);
  return { marks, grade: band.grade, gradeValue: band.gradeValue };
}

export const cellPassed = (cell: MarkCell) => cell.gradeValue !== null && cell.gradeValue > 0;

export type SubjectOutcome = { status: "INCOMPLETE" | "PASS" | "FAIL"; gpa: number | null };

// A subject passes only if every component passes. GPA = Σ(gradeValue × credit hours) / Σ credit hours.
export function summarizeSubject(defs: ComponentDef[], cells: MarkCell[]): SubjectOutcome {
  if (cells.length === 0 || cells.some((c) => c.marks === null)) return { status: "INCOMPLETE", gpa: null };
  const credits = defs.reduce((sum, d) => sum + d.creditHours, 0);
  const points = defs.reduce((sum, d, i) => sum + (cells[i].gradeValue ?? 0) * d.creditHours, 0);
  return { status: cells.every(cellPassed) ? "PASS" : "FAIL", gpa: credits > 0 ? points / credits : 0 };
}

// What an admin typed into a marks box
export function parseMarksInput(raw: string, fullMarks: number): { value: number | null; error?: string } {
  const text = raw.trim();
  if (text === "") return { value: null };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { value: null, error: "Numbers only (max 2 decimals)" };
  const value = Number(text);
  if (value > fullMarks) return { value: null, error: `Max is ${fullMarks}` };
  return { value };
}

// ── Merges the saved sheet with what has been typed so far ──

export interface ViewCell {
  def: ComponentDef;
  key: string; // `${enrollmentId}:${componentId}`
  raw: string;
  error?: string;
  value: number | null;
  changed: boolean;
  preview: MarkCell;
}

export interface ViewRow {
  row: SheetRow;
  index: number;
  cells: ViewCell[];
  summary: SubjectOutcome;
}

export function buildEditView(sheet: SubjectSheet, edits: Record<string, string>, scale: GradeBand[]) {
  const changed: SaveMarksEntry[] = [];
  let invalidCount = 0;

  const rows: ViewRow[] = sheet.rows.map((row, index) => {
    const cells: ViewCell[] = sheet.components.map((def) => {
      const key = `${row.enrollmentId}:${def.id}`;
      const original = row.cells[String(def.id)]?.marks ?? null;
      const typed = edits[key];
      const edited = typed !== undefined;
      const parsed = edited ? parseMarksInput(typed, def.fullMarks) : { value: original, error: undefined };
      const isChanged = edited && !parsed.error && parsed.value !== original;

      if (isChanged) changed.push({ enrollmentId: row.enrollmentId, componentId: def.id, marks: parsed.value });
      if (parsed.error) invalidCount += 1;

      return {
        def,
        key,
        raw: typed ?? (original === null ? "" : String(original)),
        error: parsed.error,
        value: parsed.value,
        changed: isChanged,
        preview: computeCell(def, parsed.error ? null : parsed.value, scale),
      };
    });

    return { row, index, cells, summary: summarizeSubject(sheet.components, cells.map((c) => c.preview)) };
  });

  return { rows, changed, invalidCount };
}