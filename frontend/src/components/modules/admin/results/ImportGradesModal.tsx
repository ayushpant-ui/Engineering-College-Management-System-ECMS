"use client";

import { useMemo, useRef, useState } from "react";
import { FileUp } from "lucide-react";

import Modal from "@/components/modules/admin/Modal";
import { importToEdits, parseGradeSheet } from "@/lib/result-import";
import type { GradeBand, SubjectSheet } from "@/lib/result-types";

export default function ImportGradesModal({
  sheet,
  scale,
  onApply,
  onClose,
}: {
  sheet: SubjectSheet;
  scale: GradeBand[];
  onApply: (edits: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const preview = useMemo(
    () => parseGradeSheet(text, sheet.components, sheet.rows, scale),
    [text, sheet.components, sheet.rows, scale]
  );

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileError("");
    if (!/\.(csv|txt|tsv)$/i.test(file.name)) {
      setFileError("Please choose a .csv file. In Excel: File → Save As → CSV. Or just copy and paste the cells.");
      return;
    }
    setText(await file.text());
  }

  const columnsHint = [
    "Registration No.",
    ...sheet.components.map((c) => (c.type === "THEORY" ? "Theory" : "Practical")),
    "Final",
  ].join(" | ");

  return (
    <Modal title={`Import grades: ${sheet.subject.code}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">How to import from Excel</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>
              In your sheet, select the columns <span className="font-medium text-foreground">{columnsHint}</span>, with
              the header row if there is one.
            </li>
            <li>Copy them (Ctrl+C) and paste into the box below (Ctrl+V).</li>
            <li>Check the preview, then apply. Nothing is saved until you press Save on the grades page.</li>
          </ol>
          <p className="mt-2">
            A sheet with just two columns (registration number and final grade) also works. Empty cells are skipped, so
            existing grades are never erased.
          </p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="paste" className="text-sm font-medium">Paste your grades here</label>
            <button
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary"
            >
              <FileUp className="h-3.5 w-3.5" />
              Choose a CSV file
            </button>
            <input ref={fileInput} type="file" accept=".csv,.txt,.tsv,text/csv" onChange={onFile} className="hidden" />
          </div>
          <textarea
            id="paste"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Registration No\tTheory\tFinal\nCE-2024-002\tA\tA\nCE-2024-003\tB+\tB+"}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {fileError && <p role="alert" className="mt-1 text-sm text-red-500">{fileError}</p>}
        </div>

        {preview.rows.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Understood as: {preview.columns}</p>
            <p className="mt-1 text-sm">
              <span className="font-medium text-green-600">{preview.readyCount} ready</span>
              {preview.problemCount > 0 && (
                <span className="font-medium text-red-500"> · {preview.problemCount} with problems (skipped)</span>
              )}
            </p>

            <div className="mt-2 max-h-64 overflow-auto rounded-xl border">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="sticky top-0 bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Line</th>
                    <th className="px-3 py-2 font-semibold">Student</th>
                    {sheet.components.map((c) => (
                      <th key={c.id} className="px-3 py-2 font-semibold">{c.type === "THEORY" ? "Theory" : "Practical"}</th>
                    ))}
                    <th className="px-3 py-2 font-semibold">Final</th>
                    <th className="px-3 py-2 font-semibold">Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.rows.map((item) => (
                    <tr key={item.line} className={item.issues.length > 0 ? "bg-red-50/60 dark:bg-red-500/5" : ""}>
                      <td className="px-3 py-2 text-muted-foreground">{item.line}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium">{item.registrationNumber || "—"}</span>
                        {item.row && <span className="block text-xs text-muted-foreground">{item.row.fullName}</span>}
                      </td>
                      {sheet.components.map((c) => (
                        <td key={c.id} className="px-3 py-2">{item.componentGrades[String(c.id)] ?? "—"}</td>
                      ))}
                      <td className="px-3 py-2 font-semibold">{item.finalGrade ?? "—"}</td>
                      <td className="px-3 py-2 text-xs">
                        {item.issues.length === 0 ? (
                          <span className="text-green-600">OK</span>
                        ) : (
                          <span className="text-red-500">{item.issues.join("; ")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={() => {
              onApply(importToEdits(preview));
              onClose();
            }}
            disabled={preview.readyCount === 0}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply {preview.readyCount > 0 ? `${preview.readyCount} rows` : ""} to the sheet
          </button>
        </div>
      </div>
    </Modal>
  );
}