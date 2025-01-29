/*
  Warnings:

  - You are about to drop the column `classId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalHours` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_classId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "classId",
DROP COLUMN "totalHours";

-- CreateTable
CREATE TABLE "StudentUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "classId" INTEGER,

    CONSTRAINT "StudentUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TeacherUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentUser_userId_key" ON "StudentUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherUser_userId_key" ON "TeacherUser"("userId");

-- AddForeignKey
ALTER TABLE "StudentUser" ADD CONSTRAINT "StudentUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentUser" ADD CONSTRAINT "StudentUser_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherUser" ADD CONSTRAINT "TeacherUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "StudentUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
