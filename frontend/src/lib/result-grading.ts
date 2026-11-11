import type { ComponentDef, GradeBand, SaveGradesEntry, SheetRow, SubjectSheet } from "@/lib/result-types";

// Only used by the mock. The real scale comes from GET /admin/results/grade-scale (the GradeScale table).
export const DEFAULT_GRADE_SCALE: GradeBand[] = [
  { grade: "A+", gradeValue: 4.0 },
  { grade: "A", gradeValue: 3.7 },
  { grade: "B+", gradeValue: 3.3 },
  { grade: "B", gradeValue: 2.8 },
  { grade: "C+", gradeValue: 2.4 },
  { grade: "C", gradeValue: 2.0 },
  { grade: "F", gradeValue: 0 },
];

export const gradeValueOf = (scale: GradeBand[], grade: string | null) =>
  grade === null ? null : (scale.find((b) => b.grade === grade)?.gradeValue ?? null);

// What an admin typed (or pasted) into a grade box: "b+", " A ", "a" ...
export function normalizeGrade(raw: string, scale: GradeBand[]): { value: string | null; error?: string } {
  const text = raw.trim().toUpperCase();
  if (text === "") return { value: null };
  const found = scale.find((b) => b.grade.toUpperCase() === text);
  return found ? { value: found.grade } : { value: null, error: "Not a valid grade" };
}

// ── Merges the saved sheet with what has been typed so far ──

export interface GradeCellView {
  id: string; // key used in the edits map
  kind: "COMPONENT" | "FINAL";
  componentId?: number;
  label: string;
  raw: string;
  error?: string;
  value: string | null;
  changed: boolean;
}

export interface GradeRowView {
  row: SheetRow;
  index: number;
  cells: GradeCellView[]; // components first, final grade last
  finalValue: string | null;
  gradeValue: number | null; // from the grade scale, shown as a preview
}

export const componentKey = (enrollmentId: number, componentId: number) => `${enrollmentId}:C${componentId}`;
export const finalKey = (enrollmentId: number) => `${enrollmentId}:F`;

const typeLabel = { THEORY: "Theory", PRACTICAL: "Practical" } as const;

export function buildGradeView(sheet: SubjectSheet, edits: Record<string, string>, scale: GradeBand[]) {
  const entries: SaveGradesEntry[] = [];
  let changedCount = 0;
  let invalidCount = 0;

  const rows: GradeRowView[] = sheet.rows.map((row, index) => {
    const entry: SaveGradesEntry = { enrollmentId: row.enrollmentId };

    const makeCell = (
      id: string,
      kind: GradeCellView["kind"],
      label: string,
      original: string | null,
      componentId?: number
    ): GradeCellView => {
      const typed = edits[id];
      const edited = typed !== undefined;
      const parsed = edited ? normalizeGrade(typed, scale) : { value: original, error: undefined };
      const changed = edited && !parsed.error && parsed.value !== original;
      if (parsed.error) invalidCount += 1;
      if (changed) {
        changedCount += 1;
        if (kind === "FINAL") entry.finalGrade = parsed.value;
        else (entry.componentGrades ??= {})[String(componentId)] = parsed.value;
      }
      return { id, kind, componentId, label, raw: typed ?? original ?? "", error: parsed.error, value: parsed.value, changed };
    };

    const cells = [
      ...sheet.components.map((def) =>
        makeCell(componentKey(row.enrollmentId, def.id), "COMPONENT", typeLabel[def.type], row.componentGrades[String(def.id)] ?? null, def.id)
      ),
      makeCell(finalKey(row.enrollmentId), "FINAL", "Final grade", row.finalGrade),
    ];

    if (entry.finalGrade !== undefined || entry.componentGrades) entries.push(entry);

    const finalValue = cells[cells.length - 1].error ? null : cells[cells.length - 1].value;
    return { row, index, cells, finalValue, gradeValue: gradeValueOf(scale, finalValue) };
  });

  return { rows, entries, changedCount, invalidCount };
}

// Used by the importer to keep the column order of a subject's components
export const componentLabel = (def: ComponentDef) => typeLabel[def.type];