-- AlterTable
ALTER TABLE "MessInvitation" ADD COLUMN "invitation_send" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "invitation_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "last_invitation_error" TEXT;
