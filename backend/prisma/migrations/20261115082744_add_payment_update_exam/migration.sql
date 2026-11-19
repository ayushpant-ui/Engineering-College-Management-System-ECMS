/*
  Warnings:

  - Added the required column `backPaperFee` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examStartsAt` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fee` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formClosesAt` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formOpensAt` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `exams` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExamApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETE', 'FAILED', 'CANCELED', 'REFUNDED', 'PARTIAL_REFUND', 'REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('ESEWA');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "backPaperFee" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "examStartsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fee" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "formClosesAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "formOpensAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "exam_applications" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "backPapers" JSONB,
    "totalFee" DECIMAL(10,2) NOT NULL,
    "status" "ExamApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "remark" TEXT,
    "symbolNumber" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "exam_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NPR',
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'ESEWA',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionUuid" TEXT NOT NULL,
    "transactionCode" TEXT,
    "referenceId" TEXT,
    "productCode" TEXT NOT NULL,
    "failureReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_applications_examId_status_idx" ON "exam_applications"("examId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "exam_applications_studentId_examId_key" ON "exam_applications"("studentId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionUuid_key" ON "payments"("transactionUuid");

-- CreateIndex
CREATE INDEX "payments_applicationId_idx" ON "payments"("applicationId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "exams_isPublished_formOpensAt_idx" ON "exams"("isPublished", "formOpensAt");

-- AddForeignKey
ALTER TABLE "exam_applications" ADD CONSTRAINT "exam_applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_applications" ADD CONSTRAINT "exam_applications_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "exam_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
