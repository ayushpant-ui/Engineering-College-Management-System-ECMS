/*
  Warnings:

  - You are about to drop the column `fullMarks` on the `curriculum_subjects` table. All the data in the column will be lost.
  - You are about to drop the column `passMarks` on the `curriculum_subjects` table. All the data in the column will be lost.
  - You are about to alter the column `oldMarks` on the `result_audit` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(6,2)`.
  - You are about to alter the column `newMarks` on the `result_audit` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(6,2)`.
  - You are about to drop the column `marksObtained` on the `results` table. All the data in the column will be lost.
  - You are about to drop the column `creditHours` on the `subjects` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubjectComponentType" AS ENUM ('THEORY', 'PRACTICAL');

-- AlterTable
ALTER TABLE "curriculum_subjects" DROP COLUMN "fullMarks",
DROP COLUMN "passMarks";

-- AlterTable
ALTER TABLE "result_audit" ADD COLUMN     "resultComponentId" INTEGER,
ALTER COLUMN "oldMarks" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "newMarks" SET DATA TYPE DECIMAL(6,2);

-- AlterTable
ALTER TABLE "results" DROP COLUMN "marksObtained";

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "creditHours";

-- CreateTable
CREATE TABLE "subject_components" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "type" "SubjectComponentType" NOT NULL,

    CONSTRAINT "subject_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_subject_components" (
    "id" SERIAL NOT NULL,
    "curriculumSubjectId" INTEGER NOT NULL,
    "componentId" INTEGER NOT NULL,
    "creditHours" INTEGER NOT NULL,
    "fullMarks" DECIMAL(6,2) NOT NULL,
    "passMarks" DECIMAL(6,2),

    CONSTRAINT "curriculum_subject_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_scales" (
    "id" SERIAL NOT NULL,
    "grade" TEXT NOT NULL,
    "minPercentage" DECIMAL(5,2) NOT NULL,
    "maxPercentage" DECIMAL(5,2) NOT NULL,
    "gradeValue" DECIMAL(4,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_components" (
    "id" SERIAL NOT NULL,
    "resultId" INTEGER NOT NULL,
    "curriculumSubjectComponentId" INTEGER NOT NULL,
    "marksObtained" DECIMAL(6,2),
    "obtainedGrade" TEXT,
    "gradeValue" DECIMAL(4,2),
    "gradePoint" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_components_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subject_components_subjectId_type_key" ON "subject_components"("subjectId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_subject_components_curriculumSubjectId_component_key" ON "curriculum_subject_components"("curriculumSubjectId", "componentId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_scales_grade_key" ON "grade_scales"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "result_components_resultId_curriculumSubjectComponentId_key" ON "result_components"("resultId", "curriculumSubjectComponentId");

-- AddForeignKey
ALTER TABLE "result_audit" ADD CONSTRAINT "result_audit_resultComponentId_fkey" FOREIGN KEY ("resultComponentId") REFERENCES "result_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_components" ADD CONSTRAINT "subject_components_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subject_components" ADD CONSTRAINT "curriculum_subject_components_curriculumSubjectId_fkey" FOREIGN KEY ("curriculumSubjectId") REFERENCES "curriculum_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subject_components" ADD CONSTRAINT "curriculum_subject_components_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "subject_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_components" ADD CONSTRAINT "result_components_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_components" ADD CONSTRAINT "result_components_curriculumSubjectComponentId_fkey" FOREIGN KEY ("curriculumSubjectComponentId") REFERENCES "curriculum_subject_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
