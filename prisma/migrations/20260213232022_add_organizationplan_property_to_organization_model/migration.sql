/*
  Warnings:

  - A unique constraint covering the columns `[id,name]` on the table `OrganizationPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationPlan` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_organizationPlanId_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "organizationPlan" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationPlan_id_name_key" ON "OrganizationPlan"("id", "name");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_organizationPlanId_organizationPlan_fkey" FOREIGN KEY ("organizationPlanId", "organizationPlan") REFERENCES "OrganizationPlan"("id", "name") ON DELETE RESTRICT ON UPDATE CASCADE;
