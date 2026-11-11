export interface ExamPeriod {
  id: number;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export interface ExamPeriodInput {
  name: string;
  startsAt: string | null;
  endsAt: string | null;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("adminToken")
      : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

if (!response.ok) {
  const error = await response.json().catch(() => null);

  const message = Array.isArray(error?.message)
    ? error.message.join(", ")
    : error?.message || "Something went wrong";

  throw new Error(message);
}
  return response.json();
}

export const examPeriodApi = {
  // Get all exam periods
  async getAll(): Promise<ExamPeriod[]> {
    const response = await request<ApiResponse<ExamPeriod[]>>(
      "/admin/results/exam-periods",
    );

    return response.data;
  },

  // Create exam period
  create: (data: ExamPeriodInput) =>
    request<ApiResponse<ExamPeriod>>("/admin/results/exam-periods", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update exam period
  update: (id: number, data: ExamPeriodInput) =>
    request<ApiResponse<ExamPeriod>>(`/admin/results/exam-periods/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete exam period
  remove: (id: number) =>
    request<void>(`/admin/results/exam-periods/${id}`, {
      method: "DELETE",
    }),
};