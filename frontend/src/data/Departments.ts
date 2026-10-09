export type DepartmentIconKey = "computer" | "civil" | "electrical" | "mechanical";

export interface Department {
  slug: string;
  name: string;
  code: string;
  icon: DepartmentIconKey;
  shortDescription: string;
  description: string;
  program: string;
  duration: string;
  intake: number;
  facultyCount: number;
  labs: string[];
  careers: string[];
}

// Placeholder content — replace with your real department details.
// Later you can fetch this shape from the backend (GET /api/v1/departments).
export const departments: Department[] = [
  {
    slug: "computer-engineering",
    name: "Computer Engineering",
    code: "CE",
    icon: "computer",
    shortDescription:
      "Software, networks, databases and intelligent systems for the digital age.",
    description:
      "The Department of Computer Engineering prepares students to design, build and maintain software and hardware systems. The curriculum combines programming, data structures, databases, networking, operating systems and emerging areas such as AI and cloud computing.",
    program: "B.E. Computer Engineering",
    duration: "4 Years (8 Semesters)",
    intake: 48,
    facultyCount: 12,
    labs: ["Programming Lab", "Networking Lab", "Database Lab", "Project Lab"],
    careers: ["Software Engineer", "Network Engineer", "Data Analyst", "System Administrator"],
  },
  {
    slug: "civil-engineering",
    name: "Civil Engineering",
    code: "CIV",
    icon: "civil",
    shortDescription:
      "Planning, designing and constructing the infrastructure society relies on.",
    description:
      "The Department of Civil Engineering focuses on structural design, construction management, water resources, transportation and geotechnical engineering, with strong emphasis on field work and surveying.",
    program: "B.E. Civil Engineering",
    duration: "4 Years (8 Semesters)",
    intake: 48,
    facultyCount: 10,
    labs: ["Surveying Lab", "Concrete Lab", "Soil Mechanics Lab", "Hydraulics Lab"],
    careers: ["Site Engineer", "Structural Designer", "Project Manager", "Government Engineer"],
  },
  {
    slug: "electrical-engineering",
    name: "Electrical Engineering",
    code: "EE",
    icon: "electrical",
    shortDescription:
      "Power systems, electronics and control for a connected, energy-driven world.",
    description:
      "The Department of Electrical Engineering covers power generation and distribution, electrical machines, control systems, electronics and renewable energy, preparing graduates for the energy and industrial sectors.",
    program: "B.E. Electrical Engineering",
    duration: "4 Years (8 Semesters)",
    intake: 48,
    facultyCount: 9,
    labs: ["Machines Lab", "Electronics Lab", "Power Systems Lab", "Control Lab"],
    careers: ["Power Engineer", "Electronics Engineer", "Maintenance Engineer", "Renewable Energy Specialist"],
  },
];

export function getDepartmentBySlug(slug: string) {
  return departments.find((d) => d.slug === slug);
}