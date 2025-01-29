/*
  Warnings:

  - You are about to drop the column `classId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `Log` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_classId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "classId";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "classId";
