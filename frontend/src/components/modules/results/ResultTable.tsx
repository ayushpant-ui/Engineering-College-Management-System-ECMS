import { getGrade, getPercent, isPassed, type SubjectResult } from "@/lib/results";

export default function ResultsTable({ subjects }: { subjects: SubjectResult[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">Code</th>
            <th className="px-4 py-3 font-semibold">Subject</th>
            <th className="px-4 py-3 text-center font-semibold">Credit</th>
            <th className="px-4 py-3 text-center font-semibold">Marks</th>
            <th className="px-4 py-3 text-center font-semibold">Grade</th>
            <th className="px-4 py-3 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {subjects.map((subject) => {
            const passed = isPassed(subject);
            const { grade } = getGrade(subject);
            return (
              <tr key={subject.code} className="text-slate-700 dark:text-slate-200">
                <td className="whitespace-nowrap px-4 py-3 font-medium">{subject.code}</td>
                <td className="px-4 py-3">{subject.name}</td>
                <td className="px-4 py-3 text-center">{subject.creditHours}</td>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  {subject.marksObtained}/{subject.fullMarks}
                  <span className="ml-1.5 text-xs text-slate-400">
                    ({getPercent(subject).toFixed(0)}%)
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-semibold">{grade}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      passed
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    }`}
                  >
                    {passed ? "Pass" : "Fail"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}