-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CASH_IN', 'CASH_OUT');

-- CreateTable
CREATE TABLE "MessTransaction" (
    "transaction_id" SERIAL NOT NULL,
    "mess_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Others',
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessTransaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE INDEX "MessTransaction_mess_id_idx" ON "MessTransaction"("mess_id");

-- CreateIndex
CREATE INDEX "MessTransaction_user_id_idx" ON "MessTransaction"("user_id");

-- CreateIndex
CREATE INDEX "MessTransaction_mess_id_transaction_date_idx" ON "MessTransaction"("mess_id", "transaction_date");

-- CreateIndex
CREATE INDEX "MessTransaction_mess_id_transaction_type_idx" ON "MessTransaction"("mess_id", "transaction_type");

-- AddForeignKey
ALTER TABLE "MessTransaction" ADD CONSTRAINT "MessTransaction_mess_id_fkey" FOREIGN KEY ("mess_id") REFERENCES "Mess"("mess_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessTransaction" ADD CONSTRAINT "MessTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
