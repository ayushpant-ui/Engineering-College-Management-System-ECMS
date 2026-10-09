export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  departmentCode: string; // must match a `code` in data/departments.ts
  email: string;
  specialization: string[];
  qualification: string;
  photoUrl?: string; // e.g. "/faculty/ram-sharma.jpg" in /public/faculty
}

// Placeholder data — replace with your real faculty.
// Later: fetch from GET /api/v1/faculty (Prisma Faculty model).
export const facultyMembers: FacultyMember[] = [
  {
    id: "f1",
    name: "Dr. Ramesh Sharma",
    designation: "Professor & Head of Department",
    departmentCode: "CE",
    email: "ramesh.sharma@example.com",
    specialization: ["Artificial Intelligence", "Data Mining"],
    qualification: "PhD, Computer Science",
  },
  {
    id: "f2",
    name: "Sita Joshi",
    designation: "Assistant Professor",
    departmentCode: "CE",
    email: "sita.joshi@example.com",
    specialization: ["Database Systems", "Web Technologies"],
    qualification: "M.Sc., Computer Engineering",
  },
  {
    id: "f3",
    name: "Er. Bikash Thapa",
    designation: "Lecturer",
    departmentCode: "CE",
    email: "bikash.thapa@example.com",
    specialization: ["Computer Networks", "Cyber Security"],
    qualification: "M.E., Information Systems",
  },
  {
    id: "f4",
    name: "Dr. Anita Bhatt",
    designation: "Professor & Head of Department",
    departmentCode: "CIV",
    email: "anita.bhatt@example.com",
    specialization: ["Structural Engineering", "Earthquake Design"],
    qualification: "PhD, Structural Engineering",
  },
  {
    id: "f5",
    name: "Er. Prakash Rawal",
    designation: "Lecturer",
    departmentCode: "CIV",
    email: "prakash.rawal@example.com",
    specialization: ["Hydraulics", "Water Resources"],
    qualification: "M.Sc., Water Resources Engineering",
  },
  {
    id: "f6",
    name: "Dr. Kamal Oli",
    designation: "Associate Professor",
    departmentCode: "EE",
    email: "kamal.oli@example.com",
    specialization: ["Power Systems", "Renewable Energy"],
    qualification: "PhD, Electrical Engineering",
  },
];