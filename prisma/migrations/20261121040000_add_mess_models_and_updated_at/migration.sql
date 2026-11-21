-- CreateEnum
CREATE TYPE "MessRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MessInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED', 'EXPIRED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Mess" (
    "mess_id" TEXT NOT NULL,
    "mess_name" TEXT NOT NULL,
    "mess_code" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mess_pkey" PRIMARY KEY ("mess_id")
);

-- CreateTable
CREATE TABLE "MessMembership" (
    "membership_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "mess_id" TEXT NOT NULL,
    "role" "MessRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessMembership_pkey" PRIMARY KEY ("membership_id")
);

-- CreateTable
CREATE TABLE "MessInvitation" (
    "invitation_id" SERIAL NOT NULL,
    "mess_id" TEXT NOT NULL,
    "invited_by_id" INTEGER NOT NULL,
    "invited_user_id" INTEGER,
    "invited_email" TEXT,
    "status" "MessInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "MessInvitation_pkey" PRIMARY KEY ("invitation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mess_mess_code_key" ON "Mess"("mess_code");

-- CreateIndex
CREATE INDEX "Mess_created_by_idx" ON "Mess"("created_by");

-- CreateIndex
CREATE INDEX "MessMembership_mess_id_idx" ON "MessMembership"("mess_id");

-- CreateIndex
CREATE INDEX "MessMembership_user_id_idx" ON "MessMembership"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "MessMembership_user_id_mess_id_key" ON "MessMembership"("user_id", "mess_id");

-- CreateIndex
CREATE INDEX "MessInvitation_mess_id_idx" ON "MessInvitation"("mess_id");

-- CreateIndex
CREATE INDEX "MessInvitation_invited_by_id_idx" ON "MessInvitation"("invited_by_id");

-- CreateIndex
CREATE INDEX "MessInvitation_invited_email_idx" ON "MessInvitation"("invited_email");

-- CreateIndex
CREATE INDEX "MessInvitation_invited_user_id_idx" ON "MessInvitation"("invited_user_id");

-- AddForeignKey
ALTER TABLE "Mess" ADD CONSTRAINT "Mess_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessMembership" ADD CONSTRAINT "MessMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessMembership" ADD CONSTRAINT "MessMembership_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "Mess"("mess_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessInvitation" ADD CONSTRAINT "MessInvitation_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "Mess"("mess_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessInvitation" ADD CONSTRAINT "MessInvitation_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessInvitation" ADD CONSTRAINT "MessInvitation_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
