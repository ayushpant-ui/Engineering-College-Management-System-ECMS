-- CreateEnum
CREATE TYPE "NoticeCategory" AS ENUM ('GENERAL', 'ACADEMIC', 'EXAM', 'ADMISSION', 'EVENT');

-- CreateTable
CREATE TABLE "notices" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "NoticeCategory" NOT NULL DEFAULT 'GENERAL',
    "attachmentUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notices_isPublished_isPinned_publishedAt_idx" ON "notices"("isPublished", "isPinned", "publishedAt");

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
