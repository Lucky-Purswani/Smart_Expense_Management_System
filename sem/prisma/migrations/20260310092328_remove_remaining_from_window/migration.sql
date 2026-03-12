/*
  Warnings:

  - You are about to drop the column `remaining` on the `ExpenseWindow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExpenseWindow" DROP COLUMN "remaining";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_type_idx" ON "Transaction"("userId", "type");

-- CreateIndex
CREATE INDEX "User_isDeleted_idx" ON "User"("isDeleted");

-- CreateIndex
CREATE INDEX "UserOTP_expiresAt_idx" ON "UserOTP"("expiresAt");
