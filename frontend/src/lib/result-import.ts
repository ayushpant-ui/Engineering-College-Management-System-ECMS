import { componentKey, finalKey, normalizeGrade } from "@/lib/result-grading";
import type { ComponentDef, GradeBand, SheetRow } from "@/lib/result-types";

export interface ImportRow {
  line: number; // line number in the pasted text
  registrationNumber: string;
  row: SheetRow | null; // the student on this subject's sheet (null = not found)
  componentGrades: Record<string, string | null>;
  finalGrade: string | null;
  issues: string[];
}

export interface ImportPreview {
  rows: ImportRow[];
  readyCount: number;
  problemCount: number;
  columns: string; // what we understood, shown to the admin
}

// Excel and Google Sheets copy cells separated by TABS; CSV files use commas or semicolons
function splitLine(line: string) {
  const delimiter = line.includes("\t") ? "\t" : line.includes(",") ? "," : line.includes(";") ? ";" : null;
  return (delimiter ? line.split(delimiter) : [line]).map((cell) => cell.trim().replace(/^"|"$/g, "").trim());
}

/**
 * Understands pasted grade lists such as
 *   Registration No | Theory | Practical | Final      (with a header row), or
 *   CE-2024-002     | A      | B+        | A           (no header: reg, each component, final)
 *   CE-2024-003     | B+                               (two columns: reg, final grade)
 * Empty cells are ignored, so existing grades are never wiped by an import.
 */
export function parseGradeSheet(
  text: string,
  components: ComponentDef[],
  rows: SheetRow[],
  scale: GradeBand[]
): ImportPreview {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { rows: [], readyCount: 0, problemCount: 0, columns: "" };

  const table = lines.map(splitLine);
  const byReg = new Map(rows.map((r) => [r.registrationNumber.toLowerCase(), r]));

  // The first line is a header unless it starts with a known registration number
  const hasHeader = !byReg.has((table[0][0] ?? "").toLowerCase());
  const header = hasHeader ? table[0].map((h) => h.toLowerCase()) : null;
  const data = hasHeader ? table.slice(1) : table;

  let regCol = 0;
  const compCols: Record<number, number> = {};
  let finalCol = -1;

  if (header) {
    const found = header.findIndex((h) => /reg|roll|symbol|student/.test(h));
    regCol = found >= 0 ? found : 0;
    for (const def of components) {
      const pattern = def.type === "THEORY" ? /theory|\bth\b/ : /practical|\bpr\b|\blab\b/;
      const i = header.findIndex((h, idx) => idx !== regCol && pattern.test(h));
      if (i >= 0) compCols[def.id] = i;
    }
    finalCol = header.findIndex((h, idx) => idx !== regCol && /final|overall|total|result/.test(h));
    if (finalCol < 0) {
      // A plain "Grade" column: use the last column that isn't already taken
      const used = new Set([regCol, ...Object.values(compCols)]);
      const free = header.map((_, i) => i).filter((i) => !used.has(i));
      finalCol = free.length > 0 ? free[free.length - 1] : -1;
    }
  } else {
    const width = Math.max(...data.map((r) => r.length));
    if (width <= 2) {
      finalCol = 1; // just registration number + final grade
    } else {
      components.forEach((def, i) => (compCols[def.id] = 1 + i));
      finalCol = 1 + components.length;
    }
  }

  const label = (i: number) => `column ${i + 1}`;
  const columns = [
    `Registration no. → ${label(regCol)}`,
    ...components.filter((d) => compCols[d.id] !== undefined).map((d) => `${d.type === "THEORY" ? "Theory" : "Practical"} → ${label(compCols[d.id])}`),
    finalCol >= 0 ? `Final grade → ${label(finalCol)}` : "No final grade column found",
  ].join(" · ");

  const result: ImportRow[] = data.map((cols, i) => {
    const issues: string[] = [];
    const registrationNumber = cols[regCol] ?? "";
    const row = byReg.get(registrationNumber.toLowerCase()) ?? null;
    if (!row) issues.push("Registration number isn't on this subject's list");

    const componentGrades: Record<string, string | null> = {};
    for (const def of components) {
      const col = compCols[def.id];
      if (col === undefined) continue;
      const raw = cols[col] ?? "";
      const parsed = normalizeGrade(raw, scale);
      if (parsed.error) issues.push(`"${raw}" isn't a valid ${def.type.toLowerCase()} grade`);
      else componentGrades[String(def.id)] = parsed.value;
    }

    let finalGrade: string | null = null;
    if (finalCol >= 0) {
      const raw = cols[finalCol] ?? "";
      const parsed = normalizeGrade(raw, scale);
      if (parsed.error) issues.push(`"${raw}" isn't a valid final grade`);
      else finalGrade = parsed.value;
    }

    return { line: i + (hasHeader ? 2 : 1), registrationNumber, row, componentGrades, finalGrade, issues };
  });

  const readyCount = result.filter((r) => r.row && r.issues.length === 0).length;
  return { rows: result, readyCount, problemCount: result.length - readyCount, columns };
}

// Turns the rows that are ready into the "edits" the marks sheet understands
export function importToEdits(preview: ImportPreview): Record<string, string> {
  const edits: Record<string, string> = {};
  for (const item of preview.rows) {
    if (!item.row || item.issues.length > 0) continue;
    for (const [componentId, grade] of Object.entries(item.componentGrades)) {
      if (grade !== null) edits[componentKey(item.row.enrollmentId, Number(componentId))] = grade;
    }
    if (item.finalGrade !== null) edits[finalKey(item.row.enrollmentId)] = item.finalGrade;
  }
  return edits;
}