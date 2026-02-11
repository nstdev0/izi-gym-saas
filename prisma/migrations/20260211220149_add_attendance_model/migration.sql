/*
  Warnings:

  - You are about to drop the column `qr` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_organizationId_fkey";

-- DropIndex
DROP INDEX "Member_qr_key";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "qr";

-- DropTable
DROP TABLE "Attendance";

-- DropEnum
DROP TYPE "AttendanceMethod";
