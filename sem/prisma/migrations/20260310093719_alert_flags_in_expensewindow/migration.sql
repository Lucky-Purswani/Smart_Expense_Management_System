-- AlterTable
ALTER TABLE "ExpenseWindow" ADD COLUMN     "alert100Sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alert90Sent" BOOLEAN NOT NULL DEFAULT false;
