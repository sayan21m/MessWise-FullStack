-- DropIndex
DROP INDEX "User_mess_id_key";

-- CreateIndex
CREATE INDEX "User_mess_id_idx" ON "User"("mess_id");
