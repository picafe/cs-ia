/*
  Warnings:

  - Added the required column `description` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hours` to the `log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "log" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "hours" DOUBLE PRECISION NOT NULL;
