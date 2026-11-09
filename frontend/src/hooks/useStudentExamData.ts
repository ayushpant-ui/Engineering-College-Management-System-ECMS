"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getStoredSession } from "@/lib/auth-session";
import { examApi } from "@/lib/exam-api";
import type { Exam, ExamForm, StudentInfo } from "@/lib/exam-types";

export function getStudentInfo(): StudentInfo | null {
  const session = getStoredSession();
  if (!session) return null;
  return {
    id: String(session.id),
    fullName: session.fullName,
    registrationNumber: session.registrationNumber,
    department: session.department,
    semester: session.semester,
    photoUrl: session.photoUrl,
  };
}

// Loads the exams that apply to the logged-in student, plus their own forms.
export function useStudentExamData() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [forms, setForms] = useState<ExamForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const info = getStudentInfo();
    if (!info) {
      router.replace("/login"); // change if your login route is different
      return;
    }
    setStudent(info);

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([examApi.listExams(), examApi.listMyForms(info.id)])
      .then(([allExams, myForms]) => {
        if (cancelled) return;
        const withForm = new Set(myForms.map((f) => f.examId));
        // Show exams for the student's own semester, plus any they already have a form for
        setExams(allExams.filter((e) => e.semester === info.semester || withForm.has(e.id)));
        setForms(myForms);
      })
      .catch(() => !cancelled && setError("Could not load exams. Please try again."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  return { student, exams, forms, loading, error, reload: () => setAttempt((n) => n + 1) };
}