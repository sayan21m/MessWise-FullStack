-- DropIndex
DROP INDEX "User_mess_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "User_mess_id_key" ON "User"("mess_id");
