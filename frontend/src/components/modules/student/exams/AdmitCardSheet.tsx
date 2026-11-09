import { formatDate } from "@/lib/exam-format";
import { resolveMediaUrl } from "@/lib/student-api";
import type { Exam, ExamForm } from "@/lib/exam-types";

// Always light (white paper) so it prints correctly even when the site is in dark mode.
export default function AdmitCardSheet({
  exam,
  form,
  photoUrl,
}: {
  exam: Exam;
  form: ExamForm;
  photoUrl?: string | null;
}) {
  const photo = resolveMediaUrl(photoUrl);
  const rows = [
    { label: "Name", value: form.studentName },
    { label: "Registration No.", value: form.registrationNumber },
    { label: "Symbol No.", value: form.symbolNumber ?? "—" },
    { label: "Department", value: form.department },
    { label: "Semester", value: String(form.semester) },
    { label: "Exam center", value: exam.center },
  ];

  return (
    <>
      {/* Print only the card: hide everything else on the page */}
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body * { visibility: hidden !important; }
          #admit-card, #admit-card * { visibility: visible !important; }
          #admit-card { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
        }
      `}</style>

      <div id="admit-card" className="mx-auto max-w-3xl rounded-lg border-2 border-slate-800 bg-white p-6 text-slate-900 shadow-lg sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 border-b-2 border-slate-800 pb-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-blue-600 text-lg font-bold">
            SOE
          </div>
          <div className="flex-1 text-center">
            <p className="font-serif text-lg font-bold uppercase leading-tight sm:text-xl">Far Western University</p>
            <p className="font-serif text-base font-semibold sm:text-lg">School of Engineering</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-widest">Admit Card</p>
          </div>
          <div className="h-16 w-16 shrink-0" aria-hidden />
        </div>

        <p className="mt-4 text-center font-serif text-base font-bold sm:text-lg">{exam.name}</p>

        {/* Student */}
        <div className="mt-5 flex gap-5">
          <dl className="grid flex-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {rows.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex h-36 w-28 shrink-0 items-center justify-center overflow-hidden border-2 border-slate-800 bg-slate-50 text-center text-xs text-slate-400">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Student" className="h-full w-full object-cover" />
            ) : (
              <span>
                Affix
                <br />
                photo
              </span>
            )}
          </div>
        </div>

        {/* Schedule */}
        <table className="mt-6 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-100 text-xs uppercase tracking-wide">
              <th className="border border-slate-300 px-3 py-2 font-semibold">Date</th>
              <th className="border border-slate-300 px-3 py-2 font-semibold">Subject</th>
              <th className="border border-slate-300 px-3 py-2 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {exam.subjects.map((s) => (
              <tr key={s.id}>
                <td className="whitespace-nowrap border border-slate-300 px-3 py-2">{formatDate(s.date)}</td>
                <td className="border border-slate-300 px-3 py-2">
                  <span className="font-medium">{s.code}</span> — {s.name}
                </td>
                <td className="whitespace-nowrap border border-slate-300 px-3 py-2">{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {form.backPapers.length > 0 && (
          <p className="mt-3 text-sm">
            <span className="font-semibold">Back papers: </span>
            {form.backPapers.map((b) => `${b.code} ${b.name}`).join(", ")}{" "}
            <span className="text-slate-500">(dates as per the exam routine)</span>
          </p>
        )}

        {/* Instructions + verification */}
        <div className="mt-6 flex items-end justify-between gap-6">
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
            <li>Carry this admit card and your college ID to every exam.</li>
            <li>Arrive at the exam hall 30 minutes before the start time.</li>
            <li>Mobile phones and electronic devices are not allowed in the hall.</li>
          </ul>
          {/* Replace with a real QR code (e.g. the qrcode.react package) when the backend can verify cards */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-dashed border-slate-400 text-center text-[10px] text-slate-400">
            QR
            <br />
            code
          </div>
        </div>

        <div className="mt-10 flex justify-between text-xs text-slate-600">
          <div className="border-t border-slate-500 pt-1">Student&apos;s signature</div>
          <div className="border-t border-slate-500 pt-1">Exam Controller</div>
        </div>
        <p className="mt-4 text-center text-[10px] text-slate-400">Card ID: {form.id}</p>
      </div>
    </>
  );
}