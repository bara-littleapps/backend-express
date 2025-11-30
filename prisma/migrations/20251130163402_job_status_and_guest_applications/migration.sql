/*
  Warnings:

  - You are about to drop the column `status` on the `JobPost` table. All the data in the column will be lost.
  - Added the required column `jobStatusId` to the `JobPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_userId_fkey";

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "applicantEmail" TEXT,
ADD COLUMN     "applicantName" TEXT,
ADD COLUMN     "applicantPhone" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN "status",
ADD COLUMN     "jobStatusId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "JobStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobStatus_code_key" ON "JobStatus"("code");

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_jobStatusId_fkey" FOREIGN KEY ("jobStatusId") REFERENCES "JobStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
