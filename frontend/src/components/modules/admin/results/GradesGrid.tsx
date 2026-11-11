import type { GradeRowView } from "@/lib/result-grading";
import type { GradeBand } from "@/lib/result-types";

export default function GradesGrid({
  rows,
  scale,
  onEdit,
}: {
  rows: GradeRowView[];
  scale: GradeBand[];
  onEdit: (id: string, value: string) => void;
}) {
  const columns = rows[0]?.cells ?? [];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      {/* Suggestions that appear while typing a grade */}
      <datalist id="grade-options">
        {scale.map((b) => (
          <option key={b.grade} value={b.grade} />
        ))}
      </datalist>

      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Registration No.</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            {columns.map((cell) => (
              <th key={cell.id} className="px-4 py-3 font-semibold">
                {cell.kind === "FINAL" ? "Final grade" : `${cell.label} grade`}
              </th>
            ))}
            <th className="px-4 py-3 font-semibold">Result</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 4} className="px-4 py-14 text-center text-slate-400">
                No students are enrolled for this subject.
              </td>
            </tr>
          )}

          {rows.map((view) => (
            <tr key={view.row.enrollmentId} className={view.cells.some((c) => c.changed) ? "bg-amber-50/70 dark:bg-amber-500/5" : ""}>
              <td className="px-4 py-2.5 text-slate-400">{view.index + 1}</td>
              <td className="whitespace-nowrap px-4 py-2.5 font-medium">{view.row.registrationNumber}</td>
              <td className="px-4 py-2.5">{view.row.fullName}</td>

              {view.cells.map((cell, col) => (
                <td key={cell.id} className="px-4 py-2.5 align-top">
                  <input
                    data-cell={`${view.index}-${col}`}
                    list="grade-options"
                    value={cell.raw}
                    onChange={(e) => onEdit(cell.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Enter moves down the same column
                        document.querySelector<HTMLInputElement>(`[data-cell="${view.index + 1}-${col}"]`)?.focus();
                      }
                    }}
                    autoComplete="off"
                    maxLength={3}
                    aria-label={`${cell.kind === "FINAL" ? "Final grade" : `${cell.label} grade`} for ${view.row.fullName}`}
                    aria-invalid={!!cell.error}
                    className={`w-20 rounded-lg border bg-background px-3 py-1.5 text-center text-sm uppercase outline-none transition focus:ring-2 ${
                      cell.error
                        ? "border-red-400 focus:ring-red-400/30"
                        : cell.kind === "FINAL"
                          ? "border-primary/50 font-semibold focus:border-primary focus:ring-primary/30"
                          : "border-border focus:border-primary focus:ring-primary/30"
                    }`}
                  />
                  {cell.error && <p className="mt-1 text-xs text-red-500">{cell.error}</p>}
                </td>
              ))}

              <td className="whitespace-nowrap px-4 py-2.5 align-top">
                {view.finalValue === null ? (
                  <span className="text-xs text-slate-400">Final grade missing</span>
                ) : view.gradeValue !== null && view.gradeValue > 0 ? (
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    Pass · {view.gradeValue.toFixed(1)}
                  </span>
                ) : (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    Fail
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}