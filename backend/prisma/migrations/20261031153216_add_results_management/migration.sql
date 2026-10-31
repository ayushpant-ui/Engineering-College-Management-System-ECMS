/*
  Safe migration for ECMS results management.

  Existing Student records are preserved.
  The old department text column is migrated to a foreign key.
*/

-- ============================================
-- 1. Create enums
-- ============================================

CREATE TYPE "ExamType" AS ENUM ('REGULAR', 'BACKLOG');

CREATE TYPE "ResultStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TYPE "ResultAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'PUBLISH',
    'UNPUBLISH',
    'RECOGNIZE'
);


-- ============================================
-- 2. Create Department and AcademicYear tables
-- ============================================

CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academic_years" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 3. Add nullable columns to existing Student
-- ============================================

ALTER TABLE "Student"
ADD COLUMN "admissionYearId" INTEGER,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "departmentId" INTEGER,
ADD COLUMN "updatedAt" TIMESTAMP(3);


-- ============================================
-- 4. Create initial department and admission year
-- ============================================

INSERT INTO "departments" ("code", "name")
VALUES ('CE', 'Computer Engineering');

INSERT INTO "academic_years" ("name")
VALUES ('2025');


-- ============================================
-- 5. Backfill existing Student records
-- ============================================

UPDATE "Student"
SET
    "departmentId" = (
        SELECT "id"
        FROM "departments"
        WHERE "name" = "Student"."department"
    ),
    "admissionYearId" = (
        SELECT "id"
        FROM "academic_years"
        WHERE "name" = '2025'
    ),
    "updatedAt" = CURRENT_TIMESTAMP;


-- ============================================
-- 6. Make the new Student columns required
-- ============================================

ALTER TABLE "Student"
ALTER COLUMN "admissionYearId" SET NOT NULL,
ALTER COLUMN "departmentId" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;


-- Remove the old department text column after migrating its data.
ALTER TABLE "Student"
DROP COLUMN "department";


-- ============================================
-- 7. Create Curriculum table
-- ============================================

CREATE TABLE "curricula" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 8. Create Subject table
-- ============================================

CREATE TABLE "subjects" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creditHours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 9. Create CurriculumSubject table
-- ============================================

CREATE TABLE "curriculum_subjects" (
    "id" SERIAL NOT NULL,
    "curriculumId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "fullMarks" INTEGER NOT NULL DEFAULT 100,
    "passMarks" INTEGER,

    CONSTRAINT "curriculum_subjects_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 10. Create ExamPeriod table
-- ============================================

CREATE TABLE "exam_periods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_periods_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 11. Create Exam table
-- ============================================

CREATE TABLE "exams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "examType" "ExamType" NOT NULL,
    "examPeriodId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 12. Create ExamEnrollment table
-- ============================================

CREATE TABLE "exam_enrollments" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_enrollments_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 13. Create Result table
-- ============================================

CREATE TABLE "results" (
    "id" SERIAL NOT NULL,
    "enrollmentId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "marksObtained" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 14. Create ResultPublication table
-- ============================================

CREATE TABLE "result_publications" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "publishedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_publications_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 15. Create StudentSubjectRecord table
-- ============================================

CREATE TABLE "student_subject_records" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "recognizedResultId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_subject_records_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 16. Create ResultAudit table
-- ============================================

CREATE TABLE "result_audit" (
    "id" SERIAL NOT NULL,
    "resultId" INTEGER NOT NULL,
    "action" "ResultAction" NOT NULL,
    "oldMarks" DOUBLE PRECISION,
    "newMarks" DOUBLE PRECISION,
    "reason" TEXT,
    "adminId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "result_audit_pkey" PRIMARY KEY ("id")
);


-- ============================================
-- 17. Create indexes
-- ============================================

CREATE UNIQUE INDEX "departments_code_key"
ON "departments"("code");

CREATE UNIQUE INDEX "departments_name_key"
ON "departments"("name");

CREATE UNIQUE INDEX "academic_years_name_key"
ON "academic_years"("name");

CREATE UNIQUE INDEX "curricula_departmentId_name_version_key"
ON "curricula"("departmentId", "name", "version");

CREATE UNIQUE INDEX "subjects_code_key"
ON "subjects"("code");

CREATE INDEX "curriculum_subjects_curriculumId_semester_idx"
ON "curriculum_subjects"("curriculumId", "semester");

CREATE UNIQUE INDEX "curriculum_subjects_curriculumId_semester_subjectId_key"
ON "curriculum_subjects"("curriculumId", "semester", "subjectId");

CREATE UNIQUE INDEX "exam_periods_name_key"
ON "exam_periods"("name");

CREATE INDEX "exams_examPeriodId_semester_examType_idx"
ON "exams"("examPeriodId", "semester", "examType");

CREATE INDEX "exam_enrollments_examId_idx"
ON "exam_enrollments"("examId");

CREATE UNIQUE INDEX "exam_enrollments_studentId_examId_key"
ON "exam_enrollments"("studentId", "examId");

CREATE INDEX "results_subjectId_idx"
ON "results"("subjectId");

CREATE UNIQUE INDEX "results_enrollmentId_subjectId_key"
ON "results"("enrollmentId", "subjectId");

CREATE UNIQUE INDEX "result_publications_examId_key"
ON "result_publications"("examId");

CREATE UNIQUE INDEX "student_subject_records_recognizedResultId_key"
ON "student_subject_records"("recognizedResultId");

CREATE UNIQUE INDEX "student_subject_records_studentId_subjectId_key"
ON "student_subject_records"("studentId", "subjectId");

CREATE INDEX "result_audit_resultId_createdAt_idx"
ON "result_audit"("resultId", "createdAt");

CREATE INDEX "Student_departmentId_admissionYearId_idx"
ON "Student"("departmentId", "admissionYearId");


-- ============================================
-- 18. Create foreign-key constraints
-- ============================================

ALTER TABLE "Student"
ADD CONSTRAINT "Student_departmentId_fkey"
FOREIGN KEY ("departmentId")
REFERENCES "departments"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Student"
ADD CONSTRAINT "Student_admissionYearId_fkey"
FOREIGN KEY ("admissionYearId")
REFERENCES "academic_years"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "curricula"
ADD CONSTRAINT "curricula_departmentId_fkey"
FOREIGN KEY ("departmentId")
REFERENCES "departments"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "curriculum_subjects"
ADD CONSTRAINT "curriculum_subjects_curriculumId_fkey"
FOREIGN KEY ("curriculumId")
REFERENCES "curricula"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "curriculum_subjects"
ADD CONSTRAINT "curriculum_subjects_subjectId_fkey"
FOREIGN KEY ("subjectId")
REFERENCES "subjects"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "exams"
ADD CONSTRAINT "exams_examPeriodId_fkey"
FOREIGN KEY ("examPeriodId")
REFERENCES "exam_periods"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "exam_enrollments"
ADD CONSTRAINT "exam_enrollments_studentId_fkey"
FOREIGN KEY ("studentId")
REFERENCES "Student"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "exam_enrollments"
ADD CONSTRAINT "exam_enrollments_examId_fkey"
FOREIGN KEY ("examId")
REFERENCES "exams"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "results"
ADD CONSTRAINT "results_enrollmentId_fkey"
FOREIGN KEY ("enrollmentId")
REFERENCES "exam_enrollments"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "results"
ADD CONSTRAINT "results_subjectId_fkey"
FOREIGN KEY ("subjectId")
REFERENCES "subjects"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "result_publications"
ADD CONSTRAINT "result_publications_examId_fkey"
FOREIGN KEY ("examId")
REFERENCES "exams"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "student_subject_records"
ADD CONSTRAINT "student_subject_records_studentId_fkey"
FOREIGN KEY ("studentId")
REFERENCES "Student"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "student_subject_records"
ADD CONSTRAINT "student_subject_records_subjectId_fkey"
FOREIGN KEY ("subjectId")
REFERENCES "subjects"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "student_subject_records"
ADD CONSTRAINT "student_subject_records_recognizedResultId_fkey"
FOREIGN KEY ("recognizedResultId")
REFERENCES "results"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "result_audit"
ADD CONSTRAINT "result_audit_resultId_fkey"
FOREIGN KEY ("resultId")
REFERENCES "results"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;