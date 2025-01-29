/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Class` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Class_code_key" ON "Class"("code");
