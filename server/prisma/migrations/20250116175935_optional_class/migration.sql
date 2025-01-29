-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_classId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "classId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
