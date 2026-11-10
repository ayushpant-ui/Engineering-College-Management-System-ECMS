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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
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
    throw new Error(error?.message || "Something went wrong");
  }

  return response.json();
}

export const examPeriodApi = {
  getAll: () =>
    request<ExamPeriod[]>("/admin/exam-periods"),

  create: (data: ExamPeriodInput) =>
    request<ExamPeriod>("/admin/exam-periods", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ExamPeriodInput) =>
    request<ExamPeriod>(`/admin/exam-periods/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/admin/exam-periods/${id}`, {
      method: "DELETE",
    }),
};