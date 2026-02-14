/*
  Warnings:

  - Added the required column `pricePaid` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pricePaid" DECIMAL(10,2) NOT NULL;
