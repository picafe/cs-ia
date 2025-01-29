/*
  Warnings:

  - You are about to drop the `_StudentClasses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StudentClasses" DROP CONSTRAINT "_StudentClasses_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentClasses" DROP CONSTRAINT "_StudentClasses_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "classId" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_StudentClasses";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
