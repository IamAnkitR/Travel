/*
  Warnings:

  - You are about to drop the column `rejectionReason` on the `BusinessAccount` table. All the data in the column will be lost.
  - You are about to drop the column `requestedDestinationId` on the `BusinessAccount` table. All the data in the column will be lost.
  - You are about to drop the column `requestedType` on the `BusinessAccount` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `BusinessAccount` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `BusinessAccount` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ScopeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "BusinessAccount" DROP CONSTRAINT "BusinessAccount_requestedDestinationId_fkey";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Stay',
ADD COLUMN     "scopeId" TEXT;

-- AlterTable
ALTER TABLE "BusinessAccount" DROP COLUMN "rejectionReason",
DROP COLUMN "requestedDestinationId",
DROP COLUMN "requestedType",
DROP COLUMN "reviewedAt",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "BusinessAccountStatus";

-- CreateTable
CREATE TABLE "AccountScope" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ScopeStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "AccountScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "AccountScope_accountId_idx" ON "AccountScope"("accountId");

-- CreateIndex
CREATE INDEX "AuditLog_businessId_idx" ON "AuditLog"("businessId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "AccountScope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountScope" ADD CONSTRAINT "AccountScope_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BusinessAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountScope" ADD CONSTRAINT "AccountScope_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
