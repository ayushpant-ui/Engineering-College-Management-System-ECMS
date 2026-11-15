import type {
  ComponentType,
  Curriculum,
  CurriculumComponent,
  CurriculumDetail,
  CurriculumInput,
  CurriculumSubject,
  CurriculumSubjectInput,
  Department,
  Subject,
  SubjectInput,
} from "@/lib/curriculum-types";

/*
 * MOCK DATA LAYER (stored in this browser's localStorage)
 *
 * It enforces the same rules your database does (unique codes, unique curriculum per department,
 * one subject once per semester, Restrict on delete), so the screens behave as they will with the real API.
 * When the backend is ready, keep these method names and signatures and replace each body with fetch()
 * (see CURRICULUM-API.md). The screens don't need to change.
 *
 * To reset the demo data: DevTools → Application → Local Storage → delete "ecms-curriculum-mock-v1".
 */

const KEY = "ecms-curriculum-mock-v1";
const SEMESTER_COUNT = 8;

export class CurriculumApiError extends Error {}

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

interface DbSubject {
  id: number;
  code: string;
  name: string;
  components: ComponentType[];
}
interface DbCurriculum {
  id: number;
  name: string;
  version: string;
  departmentId: number;
}
interface DbItem {
  id: number;
  curriculumId: number;
  subjectId: number;
  semester: number;
  components: CurriculumComponent[];
}
interface Db {
  departments: Department[];
  subjects: DbSubject[];
  curricula: DbCurriculum[];
  items: DbItem[];
  seq: number;
}

function seed(): Db {
  const both: ComponentType[] = ["THEORY", "PRACTICAL"];
  const theory: ComponentType[] = ["THEORY"];

  const subjects: DbSubject[] = [
    { id: 1, code: "CMP 201", name: "Data Structures & Algorithms", components: both },
    { id: 2, code: "CMP 202", name: "Digital Logic", components: theory },
    { id: 3, code: "CMP 203", name: "Database Management Systems", components: both },
    { id: 4, code: "SH 201", name: "Engineering Mathematics III", components: theory },
    { id: 5, code: "CMP 251", name: "Theory of Computation", components: theory },
    { id: 6, code: "CMP 252", name: "Computer Networks", components: both },
    { id: 7, code: "CMP 253", name: "Microprocessors", components: both },
    { id: 8, code: "SH 251", name: "Numerical Methods", components: theory },
    { id: 9, code: "CMP 254", name: "Software Engineering", components: both },
  ];

  const credits = (type: ComponentType): CurriculumComponent => ({ type, creditHours: type === "THEORY" ? 3 : 1 });
  const items: DbItem[] = subjects.map((s, i) => ({
    id: i + 1,
    curriculumId: 1,
    subjectId: s.id,
    semester: s.id <= 4 ? 3 : 4,
    components: s.components.map(credits),
  }));

  return {
    departments: [
      { id: 1, code: "CE", name: "Computer Engineering" },
      { id: 2, code: "CIV", name: "Civil Engineering" },
      { id: 3, code: "ARCH", name: "Architecture Engineering" },
    ],
    subjects,
    curricula: [
      { id: 1, name: "Bachelor of Computer Engineering", version: "2023", departmentId: 1 },
      { id: 2, name: "Bachelor of Civil Engineering", version: "2023", departmentId: 2 },
    ],
    items,
    seq: 100,
  };
}

function save(db: Db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage can be blocked or full */
  }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* fall through to a fresh seed */
  }
  const db = seed();
  save(db);
  return db;
}

// ── Views ──

const sumCredits = (components: CurriculumComponent[]) => components.reduce((s, c) => s + c.creditHours, 0);

function subjectView(db: Db, s: DbSubject): Subject {
  const curricula = new Set(db.items.filter((i) => i.subjectId === s.id).map((i) => i.curriculumId));
  return { ...s, curriculaCount: curricula.size };
}

function curriculumView(db: Db, c: DbCurriculum): Curriculum {
  const items = db.items.filter((i) => i.curriculumId === c.id);
  return {
    id: c.id,
    name: c.name,
    version: c.version,
    department: db.departments.find((d) => d.id === c.departmentId)!,
    subjectCount: items.length,
    semesters: [...new Set(items.map((i) => i.semester))].sort((a, b) => a - b),
    totalCredits: items.reduce((s, i) => s + sumCredits(i.components), 0),
  };
}

function itemView(db: Db, item: DbItem): CurriculumSubject {
  const subject = db.subjects.find((s) => s.id === item.subjectId)!;
  return {
    id: item.id,
    semester: item.semester,
    subject: { id: subject.id, code: subject.code, name: subject.name, components: subject.components },
    components: item.components,
    creditHours: sumCredits(item.components),
  };
}

function findSubject(db: Db, id: number) {
  const subject = db.subjects.find((s) => s.id === id);
  if (!subject) throw new CurriculumApiError("Subject not found.");
  return subject;
}

function findCurriculum(db: Db, id: number) {
  const curriculum = db.curricula.find((c) => c.id === id);
  if (!curriculum) throw new CurriculumApiError("Curriculum not found.");
  return curriculum;
}

function findItem(db: Db, id: number) {
  const item = db.items.find((i) => i.id === id);
  if (!item) throw new CurriculumApiError("Curriculum subject not found.");
  return item;
}

function checkComponents(subject: DbSubject, components: CurriculumComponent[]) {
  if (components.length === 0) throw new CurriculumApiError("Choose at least one component (theory or practical).");
  const seen = new Set<ComponentType>();
  for (const c of components) {
    if (!subject.components.includes(c.type)) {
      throw new CurriculumApiError(`${subject.code} has no ${c.type.toLowerCase()} component.`);
    }
    if (seen.has(c.type)) throw new CurriculumApiError("Each component can only be added once.");
    seen.add(c.type);
    if (!Number.isInteger(c.creditHours) || c.creditHours < 1 || c.creditHours > 10) {
      throw new CurriculumApiError("Credit hours must be a whole number from 1 to 10.");
    }
  }
}

const normalizeCode = (code: string) => code.trim().replace(/\s+/g, " ").toUpperCase();

// ── API ──

export const curriculumApi = {
  async listDepartments(): Promise<Department[]> {
    await delay(100);
    return load().departments;
  },

  // Subjects

  async listSubjects(): Promise<Subject[]> {
    await delay();
    const db = load();
    return db.subjects.map((s) => subjectView(db, s)).sort((a, b) => a.code.localeCompare(b.code));
  },

  async createSubject(input: SubjectInput): Promise<Subject> {
    await delay();
    const db = load();
    const code = normalizeCode(input.code);
    if (db.subjects.some((s) => s.code === code)) throw new CurriculumApiError("A subject with this code already exists.");
    if (input.components.length === 0) throw new CurriculumApiError("Choose at least one component.");

    const subject: DbSubject = { id: ++db.seq, code, name: input.name.trim(), components: input.components };
    db.subjects.push(subject);
    save(db);
    return subjectView(db, subject);
  },

  async updateSubject(id: number, input: SubjectInput): Promise<Subject> {
    await delay();
    const db = load();
    const subject = findSubject(db, id);
    const code = normalizeCode(input.code);
    if (db.subjects.some((s) => s.id !== id && s.code === code)) {
      throw new CurriculumApiError("A subject with this code already exists.");
    }
    if (input.components.length === 0) throw new CurriculumApiError("Choose at least one component.");

    // A component can't be removed while a curriculum still gives it credit hours
    for (const type of subject.components.filter((t) => !input.components.includes(t))) {
      if (db.items.some((i) => i.subjectId === id && i.components.some((c) => c.type === type))) {
        throw new CurriculumApiError(`The ${type.toLowerCase()} part is used in a curriculum. Remove it there first.`);
      }
    }

    subject.code = code;
    subject.name = input.name.trim();
    subject.components = input.components;
    save(db);
    return subjectView(db, subject);
  },

  async deleteSubject(id: number): Promise<void> {
    await delay();
    const db = load();
    findSubject(db, id);
    if (db.items.some((i) => i.subjectId === id)) {
      throw new CurriculumApiError("This subject is part of a curriculum, so it can't be deleted.");
    }
    db.subjects = db.subjects.filter((s) => s.id !== id);
    save(db);
  },

  // Curricula

  async listCurricula(): Promise<Curriculum[]> {
    await delay();
    const db = load();
    return db.curricula.map((c) => curriculumView(db, c)).sort((a, b) => a.name.localeCompare(b.name) || b.version.localeCompare(a.version));
  },

  async createCurriculum(input: CurriculumInput): Promise<Curriculum> {
    await delay();
    const db = load();
    if (!db.departments.some((d) => d.id === input.departmentId)) throw new CurriculumApiError("Department not found.");
    const name = input.name.trim();
    const version = input.version.trim();
    if (db.curricula.some((c) => c.departmentId === input.departmentId && c.name.toLowerCase() === name.toLowerCase() && c.version.toLowerCase() === version.toLowerCase())) {
      throw new CurriculumApiError("This department already has a curriculum with the same name and version.");
    }
    const curriculum: DbCurriculum = { id: ++db.seq, name, version, departmentId: input.departmentId };
    db.curricula.push(curriculum);
    save(db);
    return curriculumView(db, curriculum);
  },

  async updateCurriculum(id: number, input: Pick<CurriculumInput, "name" | "version">): Promise<Curriculum> {
    await delay();
    const db = load();
    const curriculum = findCurriculum(db, id);
    const name = input.name.trim();
    const version = input.version.trim();
    if (db.curricula.some((c) => c.id !== id && c.departmentId === curriculum.departmentId && c.name.toLowerCase() === name.toLowerCase() && c.version.toLowerCase() === version.toLowerCase())) {
      throw new CurriculumApiError("This department already has a curriculum with the same name and version.");
    }
    curriculum.name = name;
    curriculum.version = version;
    save(db);
    return curriculumView(db, curriculum);
  },

  async deleteCurriculum(id: number): Promise<void> {
    await delay();
    const db = load();
    findCurriculum(db, id);
    if (db.items.some((i) => i.curriculumId === id)) {
      throw new CurriculumApiError("Remove all subjects from this curriculum before deleting it.");
    }
    db.curricula = db.curricula.filter((c) => c.id !== id);
    save(db);
  },

  async getCurriculum(id: number): Promise<CurriculumDetail> {
    await delay();
    const db = load();
    const curriculum = findCurriculum(db, id);
    return {
      curriculum: curriculumView(db, curriculum),
      items: db.items
        .filter((i) => i.curriculumId === id)
        .map((i) => itemView(db, i))
        .sort((a, b) => a.semester - b.semester || a.subject.code.localeCompare(b.subject.code)),
    };
  },

  // Subjects inside a curriculum

  async addSubjectToCurriculum(curriculumId: number, input: CurriculumSubjectInput): Promise<CurriculumSubject> {
    await delay();
    const db = load();
    findCurriculum(db, curriculumId);
    const subject = findSubject(db, input.subjectId);

    if (!Number.isInteger(input.semester) || input.semester < 1 || input.semester > SEMESTER_COUNT) {
      throw new CurriculumApiError(`Semester must be from 1 to ${SEMESTER_COUNT}.`);
    }
    if (db.items.some((i) => i.curriculumId === curriculumId && i.semester === input.semester && i.subjectId === input.subjectId)) {
      throw new CurriculumApiError(`${subject.code} is already in semester ${input.semester} of this curriculum.`);
    }
    checkComponents(subject, input.components);

    const item: DbItem = {
      id: ++db.seq,
      curriculumId,
      subjectId: input.subjectId,
      semester: input.semester,
      components: input.components,
    };
    db.items.push(item);
    save(db);
    return itemView(db, item);
  },

  async updateCurriculumSubject(itemId: number, components: CurriculumComponent[]): Promise<CurriculumSubject> {
    await delay();
    const db = load();
    const item = findItem(db, itemId);
    checkComponents(findSubject(db, item.subjectId), components);
    item.components = components;
    save(db);
    return itemView(db, item);
  },

  async removeCurriculumSubject(itemId: number): Promise<void> {
    await delay();
    const db = load();
    findItem(db, itemId);
    db.items = db.items.filter((i) => i.id !== itemId);
    save(db);
  },
};