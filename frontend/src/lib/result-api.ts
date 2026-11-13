import type {
  AuditEntry,
  GradeBand,
  ExamOverview,
  ExamSummary,
  SaveGradesEntry,
  StudentResultsResponse,
  SubjectSheet,
  ExamPeriod,
} from "@/lib/result-types";

export class ResultApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResultApiError";
  }
}

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Response structure returned by NestJS
interface ApiResponse<T> {
  message: string;
  data: T;
}

// Get the appropriate authentication token
function getToken() {
  if (typeof window === "undefined") return null;

  return (
    sessionStorage.getItem("adminToken") ||
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("sessionToken") ||
    localStorage.getItem("sessionToken")
  );
}

// Centralized fetch function
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Handle backend errors
  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message || "Something went wrong";

    throw new ResultApiError(message);
  }

  // Handle empty responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Extract data from { message, data } responses
async function requestData<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await request<ApiResponse<T> | T>(
    endpoint,
    options,
  );

  if (
    response !== null &&
    typeof response === "object" &&
    "data" in response
  ) {
    return response.data as T;
  }

  return response as T;
}

// Admin and Student Results API
export const resultApi = {
  // ==========================================
  // ADMIN API
  // ==========================================

  // Get grade scale
  async getGradeScale(): Promise<GradeBand[]> {
    return requestData<GradeBand[]>(
      "/admin/results/grade-scale",
    );
  },

  // Get all exams
  async listExams(): Promise<ExamSummary[]> {
    return requestData<ExamSummary[]>(
      "/admin/results/exams",
    );
  },

//   async getExamPeriods(): Promise<ExamPeriod[]> {
//   return requestData<ExamPeriod[]>("/admin/results/exam-periods");
// },

  // Get exam overview
  async getOverview(
    examId: number,
  ): Promise<ExamOverview> {
    return requestData<ExamOverview>(
      `/admin/results/exams/${examId}`,
    );
  },

  // Get subject marks sheet
  async getSubjectSheet(
    examId: number,
    subjectId: number,
  ): Promise<SubjectSheet> {
    return requestData<SubjectSheet>(
      `/admin/results/exams/${examId}/subjects/${subjectId}/students`,
    );
  },

  // Save grades
  async saveGrades(
    examId: number,
    subjectId: number,
    entries: SaveGradesEntry[],
    reason?: string,
  ): Promise<{ saved: number }> {
    return requestData<{ saved: number }>(
      `/admin/results/exams/${examId}/subjects/${subjectId}/marks`,
      {
        method: "POST",
        body: JSON.stringify({
          entries,
          reason,
        }),
      },
    );
  },

  // Publish exam results
  async publish(
    examId: number,
  ): Promise<{ publishedStudents: number }> {
    return requestData<{ publishedStudents: number }>(
      `/admin/results/exams/${examId}/publish`,
      {
        method: "POST",
      },
    );
  },

  // Unpublish exam results
  async unpublish(
    examId: number,
    reason: string,
  ): Promise<void> {
    await requestData<void>(
      `/admin/results/exams/${examId}/unpublish`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );
  },

  // Get result audit history
  async listAudit(
    examId: number,
    subjectId?: number,
    limit = 100,
  ): Promise<AuditEntry[]> {
    const params = new URLSearchParams();

    if (subjectId !== undefined) {
      params.set("subjectId", String(subjectId));
    }

    params.set("limit", String(limit));

    return requestData<AuditEntry[]>(
      `/admin/results/exams/${examId}/audit?${params.toString()}`,
    );
  },

  // ==========================================
  // STUDENT API
  // ==========================================

  // Get logged-in student's results
  async getMyResults(): Promise<StudentResultsResponse> {
    return requestData<StudentResultsResponse>(
      "/students/me/results",
    );
  },
};