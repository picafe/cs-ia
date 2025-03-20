-- AlterTable
ALTER TABLE "User" ADD COLUMN     "browserNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT false;
