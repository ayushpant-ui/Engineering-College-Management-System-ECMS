export interface AdminStudent {
  id: number;
  fullName: string;
  registrationNumber: string;
  semester: number;
  department: {
    id: number;
    name: string;
  };

  admissionYear: {
    id: number;
    name: string;
  };

  account: {
    mustChangePassword: boolean;
  } | null;
  // department: string | { name: string } | null;
  // mustChangePassword?: boolean;
}

export interface StudentList {
  items: AdminStudent[];
  total: number;
  page: number;
  totalPages: number;
}

export function departmentName(department: AdminStudent["department"]): string {
  if (!department) return "—";
  return typeof department === "string" ? department : department.name;
}