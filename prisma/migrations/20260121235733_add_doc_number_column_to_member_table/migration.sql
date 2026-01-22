/*
  Warnings:

  - A unique constraint covering the columns `[docNumber]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `docNumber` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "docNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Member_docNumber_key" ON "Member"("docNumber");
