/*
  Warnings:

  - You are about to drop the column `address` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `tenants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "address",
DROP COLUMN "description",
DROP COLUMN "logo_url",
DROP COLUMN "phone";
