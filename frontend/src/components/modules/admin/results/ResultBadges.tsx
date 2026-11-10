import type { ExamType, PublicationStatus } from "@/lib/result-types";

const base = "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium";

export function PublicationBadge({ status }: { status: PublicationStatus }) {
  const styles: Record<PublicationStatus, string> = {
    NOT_STARTED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    DRAFT: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    PUBLISHED: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  };
  const labels: Record<PublicationStatus, string> = {
    NOT_STARTED: "No marks yet",
    DRAFT: "Draft",
    PUBLISHED: "Published",
  };
  return <span className={`${base} ${styles[status]}`}>{labels[status]}</span>;
}

export function ExamTypeBadge({ type }: { type: ExamType }) {
  return (
    <span
      className={`${base} ${
        type === "BACKLOG"
          ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
          : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
      }`}
    >
      {type === "BACKLOG" ? "Backlog" : "Regular"}
    </span>
  );
}