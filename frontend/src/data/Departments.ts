export type DepartmentIconKey = "computer" | "civil"  | "mechanical";

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
    slug: "architecture-engineering",
    name: "Architecture Engineering",
    code: "ARCH",
    icon: "civil",
    shortDescription:
      "Designing and creating functional, sustainable buildings and spaces.",
    description:
      "The Department of Architecture Engineering focuses on the design and planning of buildings and urban spaces, integrating aesthetics, functionality, and sustainability.",
    program: "B.E. Architecture Engineering",
    duration: "5 Years (10 Semesters)",
    intake: 48,
    facultyCount: 8,
    labs: ["Design Lab", "Modeling Lab", "Construction Materials Lab", "Sustainability Lab"],
    careers: ["Architect", "Urban Planner", "Interior Designer", "Sustainability Consultant"],
  },
];

export function getDepartmentBySlug(slug: string) {
  return departments.find((d) => d.slug === slug);
}