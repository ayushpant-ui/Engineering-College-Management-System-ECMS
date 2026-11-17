import type {
  Curriculum,
  CurriculumDetail,
  CurriculumInput,
  CurriculumSubject,
  CurriculumSubjectInput,
  Department,
  Subject,
  SubjectInput,
} from "@/lib/curriculum-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class CurriculumApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CurriculumApiError";
  }
}

// Get admin authentication token
function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    sessionStorage.getItem("adminToken") ||
    localStorage.getItem("adminToken")
  );
}

// Common API request handler
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new CurriculumApiError(
      "NEXT_PUBLIC_API_URL is not configured."
    );
  }

  const token = getToken();

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
        ...options.headers,
      },
    }
  );

  // Handle empty responses
  if (response.status === 204) {
    return undefined as T;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result?.message ||
      result?.error ||
      "Something went wrong. Please try again.";

    throw new CurriculumApiError(
      Array.isArray(message) ? message[0] : message
    );
  }

  // Support backend responses in { message, data } format
  return result?.data !== undefined ? result.data : result;
}

// ======================================================
// CURRICULUM API
// ======================================================

export const curriculumApi = {

  // ====================================================
  // DEPARTMENTS
  // ====================================================

  async listDepartments(): Promise<Department[]> {
    return request<Department[]>("/admin/departments");
  },

  // ====================================================
  // SUBJECTS
  // ====================================================

  async listSubjects(): Promise<Subject[]> {
    return request<Subject[]>("/admin/subjects");
  },

  async createSubject(input: SubjectInput): Promise<Subject> {
    return request<Subject>("/admin/subjects", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateSubject(
    id: number,
    input: SubjectInput
  ): Promise<Subject> {
    return request<Subject>(`/admin/subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async deleteSubject(id: number): Promise<void> {
    return request<void>(`/admin/subjects/${id}`, {
      method: "DELETE",
    });
  },

  // ====================================================
  // CURRICULA
  // ====================================================

  async listCurricula(): Promise<Curriculum[]> {
    return request<Curriculum[]>("/admin/curricula");
  },

  async createCurriculum(
    input: CurriculumInput
  ): Promise<Curriculum> {
    return request<Curriculum>("/admin/curricula", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateCurriculum(
    id: number,
    input: Pick<CurriculumInput, "name" | "version">
  ): Promise<Curriculum> {
    return request<Curriculum>(`/admin/curricula/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async deleteCurriculum(id: number): Promise<void> {
    return request<void>(`/admin/curricula/${id}`, {
      method: "DELETE",
    });
  },

  async getCurriculum(id: number): Promise<CurriculumDetail> {
    return request<CurriculumDetail>(`/admin/curricula/${id}`);
  },

  // ====================================================
  // SUBJECTS INSIDE A CURRICULUM
  // ====================================================

  async addSubjectToCurriculum(
    curriculumId: number,
    input: CurriculumSubjectInput
  ): Promise<CurriculumSubject> {
    return request<CurriculumSubject>(
      `/admin/curricula/${curriculumId}/subjects`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
  },

  async updateCurriculumSubject(
    itemId: number,
    components: CurriculumSubjectInput["components"]
  ): Promise<CurriculumSubject> {
    return request<CurriculumSubject>(
      `/admin/curriculum-subjects/${itemId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ components }),
      }
    );
  },

  async removeCurriculumSubject(itemId: number): Promise<void> {
    return request<void>(
      `/admin/curriculum-subjects/${itemId}`,
      {
        method: "DELETE",
      }
    );
  },
};