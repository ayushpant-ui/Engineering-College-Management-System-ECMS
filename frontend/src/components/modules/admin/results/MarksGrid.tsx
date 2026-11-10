import type { ComponentDef } from "@/lib/result-types";
import type { ViewRow } from "@/lib/result-grading";

const typeLabel = { THEORY: "Theory", PRACTICAL: "Practical" } as const;

export default function MarksGrid({
  components,
  rows,
  onEdit,
}: {
  components: ComponentDef[];
  rows: ViewRow[];
  onEdit: (key: string, value: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Registration No.</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            {components.map((def) => (
              <th key={def.id} className="px-4 py-3 font-semibold">
                {typeLabel[def.type]}
                <span className="block text-[11px] font-normal normal-case tracking-normal text-slate-400">
                  out of {def.fullMarks}
                  {def.passMarks !== null && ` · pass ${def.passMarks}`} · {def.creditHours} cr
                </span>
              </th>
            ))}
            <th className="px-4 py-3 font-semibold">Subject result</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.length === 0 && (
            <tr>
              <td colSpan={components.length + 4} className="px-4 py-14 text-center text-slate-400">
                No students are enrolled for this subject.
              </td>
            </tr>
          )}

          {rows.map((view) => {
            const rowChanged = view.cells.some((c) => c.changed);
            return (
              <tr key={view.row.enrollmentId} className={rowChanged ? "bg-amber-50/70 dark:bg-amber-500/5" : ""}>
                <td className="px-4 py-2.5 text-slate-400">{view.index + 1}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium">{view.row.registrationNumber}</td>
                <td className="px-4 py-2.5">{view.row.fullName}</td>

                {view.cells.map((cell, col) => (
                  <td key={cell.key} className="px-4 py-2.5 align-top">
                    <input
                      data-cell={`${view.index}-${col}`}
                      inputMode="decimal"
                      value={cell.raw}
                      onChange={(e) => onEdit(cell.key, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Enter moves down the same column
                          document.querySelector<HTMLInputElement>(`[data-cell="${view.index + 1}-${col}"]`)?.focus();
                        }
                      }}
                      aria-label={`${typeLabel[cell.def.type]} marks for ${view.row.fullName}`}
                      aria-invalid={!!cell.error}
                      className={`w-24 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none transition focus:ring-2 ${
                        cell.error
                          ? "border-red-400 focus:ring-red-400/30"
                          : "border-border focus:border-primary focus:ring-primary/30"
                      }`}
                    />
                    {cell.error ? (
                      <p className="mt-1 text-xs text-red-500">{cell.error}</p>
                    ) : (
                      cell.preview.grade && (
                        <p
                          className={`mt-1 text-xs font-medium ${
                            (cell.preview.gradeValue ?? 0) > 0 ? "text-slate-500" : "text-red-500"
                          }`}
                        >
                          {cell.preview.grade} · {cell.preview.gradeValue?.toFixed(1)}
                        </p>
                      )
                    )}
                  </td>
                ))}

                <td className="whitespace-nowrap px-4 py-2.5 align-top">
                  {view.summary.status === "INCOMPLETE" && <span className="text-xs text-slate-400">Incomplete</span>}
                  {view.summary.status === "PASS" && (
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                      Pass · {view.summary.gpa?.toFixed(2)}
                    </span>
                  )}
                  {view.summary.status === "FAIL" && (
                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                      Fail
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}