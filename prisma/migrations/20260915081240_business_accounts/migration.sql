-- CreateEnum
CREATE TYPE "BusinessAccountStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "ownerId" TEXT;

-- CreateTable
CREATE TABLE "BusinessAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT,
    "status" "BusinessAccountStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "requestedDestinationId" TEXT NOT NULL,
    "requestedType" TEXT NOT NULL,

    CONSTRAINT "BusinessAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAccount_email_key" ON "BusinessAccount"("email");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "BusinessAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAccount" ADD CONSTRAINT "BusinessAccount_requestedDestinationId_fkey" FOREIGN KEY ("requestedDestinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
