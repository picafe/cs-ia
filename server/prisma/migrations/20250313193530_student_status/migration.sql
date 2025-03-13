-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('NOT_STARTED', 'ON_TRACK', 'CONCERN', 'ALERT', 'COMPLETED');

-- AlterTable
ALTER TABLE "StudentUser" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- DropEnum
DROP TYPE "ProgressStatus";
