/*
  Warnings:

  - You are about to drop the column `settings` on the `Organization` table. All the data in the column will be lost.
  - Added the required column `config` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "settings",
ADD COLUMN     "config" JSONB NOT NULL;
