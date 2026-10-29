export interface AdminStudent {
  id: number;
  fullName: string;
  registrationNumber: string;
  semester: number;
  // The backend returns department as plain text or as an object, depending on your schema
  department: string | { name: string } | null;
  mustChangePassword?: boolean;
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