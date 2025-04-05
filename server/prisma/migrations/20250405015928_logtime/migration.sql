/*
  Warnings:

  - Added the required column `time` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "time" DOUBLE PRECISION NOT NULL;
