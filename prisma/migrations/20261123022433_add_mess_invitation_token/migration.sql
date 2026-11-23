/*
  Warnings:

  - A unique constraint covering the columns `[token_hash]` on the table `MessInvitation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MessInvitation" ADD COLUMN     "token_hash" TEXT,
ADD COLUMN     "used_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "MessInvitation_token_hash_key" ON "MessInvitation"("token_hash");
