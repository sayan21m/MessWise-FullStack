-- DropIndex
DROP INDEX IF EXISTS "User_mess_id_key";
DROP INDEX IF EXISTS "User_mess_id_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "mess_name";
ALTER TABLE "User" DROP COLUMN IF EXISTS "mess_id";
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";
