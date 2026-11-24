import prisma from "../config/db.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function cashIn(user_id, mess_id, transactionData) {
  const { category, amount, description, transaction_date } = transactionData;

  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
  });

  if (!membership) {
    throw createError("You are not a member of this mess", 403);
  }

  const cashInRecord = await prisma.messTransaction.create({
    data: {
      mess_id,
      user_id,
      transaction_type: "CASH_IN",
      category,
      amount,
      description,
      transaction_date: transaction_date ? new Date(transaction_date) : new Date(),
    },
  });

  return cashInRecord;
}

export async function cashOut(user_id, mess_id, transactionData) {
  const { category, amount, description, transaction_date } = transactionData;

  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
  });

  if (!membership) {
    throw createError("You are not a member of this mess", 403);
  }

  const cashOutRecord = await prisma.messTransaction.create({
    data: {
      mess_id,
      user_id,
      transaction_type: "CASH_OUT",
      category,
      amount,
      description,
      transaction_date: transaction_date ? new Date(transaction_date) : new Date(),
    },
  });

  return cashOutRecord;
}

export async function updateTransaction(user_id, mess_id, transaction_id, transactionData) {
  const { category, amount, description, transaction_date } = transactionData;

  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
  });

  if (!membership) {
    throw createError("You are not a member of this mess", 403);
  }

  const existingTransaction = await prisma.messTransaction.findUnique({
    where: {
      transaction_id,
    },
  });

  if (!existingTransaction) {
    throw createError("Transaction record not found", 404);
  }

  if (existingTransaction.mess_id !== mess_id) {
    throw createError("Transaction doesn't belongs to this mess", 403);
  }

  const transaction = await prisma.messTransaction.update({
    where: {
      transaction_id,
    },
    data: {
      category: category !== undefined ? category : existingTransaction.category,
      amount: amount !== undefined ? amount : existingTransaction.amount,
      description: description !== undefined ? description : existingTransaction.description,
      transaction_date:
        transaction_date !== undefined
          ? new Date(transaction_date)
          : existingTransaction.transaction_date,
    },
  });

  return transaction;
}

export async function getTransactions(user_id, mess_id) {
  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
  });

  if (!membership) {
    throw createError("You are not a member of this mess", 403);
  }

  const transactions = await prisma.messTransaction.findMany({
    where: {
      mess_id,
    },
    orderBy: {
      transaction_date: "desc",
    },
  });

  return transactions;
}

export async function getTransactionById(user_id, mess_id, transaction_id) {
  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
  });

  if (!membership) {
    throw createError("You are not a member of this mess", 403);
  }

  const transaction = await prisma.messTransaction.findFirst({
    where: {
      transaction_id,
      mess_id,
    },
  });

  if (!transaction) {
    throw createError("Transaction record not found", 404);
  }

  return transaction;
}

export async function deleteTransaction(user_id, mess_id, transaction_id) {
  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
    include: {
      user: true,
    },
  });

  if (!membership) {
    throw createError("You are not a member of this mess", 403);
  }

  const existingTransaction = await prisma.messTransaction.findFirst({
    where: {
      transaction_id,
      mess_id,
    },
  });

  if (!existingTransaction) {
    throw createError("Transaction record not found", 404);
  }

  if (membership.role !== "ADMIN") {
    throw createError("Only mess admins can delete transactions", 403);
  }

  const deletedTransaction = await prisma.messTransaction.delete({
    where: {
      transaction_id,
    },
  });

  return deletedTransaction;
}

export async function getTotalMessBalance(user_id, mess_id) {
  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
  });

  if (!membership) {
    throw createError("You are not a member of this mess", 403);
  }

  const cashIn = await prisma.messTransaction.aggregate({
    where: {
      mess_id,
      transaction_type: "CASH_IN",
    },
    _sum: {
      amount: true,
    },
  });

  const cashOut = await prisma.messTransaction.aggregate({
    where: {
      mess_id,
      transaction_type: "CASH_OUT",
    },
    _sum: {
      amount: true,
    },
  });

  const totalCashIn = Number(cashIn._sum.amount ?? 0);
  const totalCashOut = Number(cashOut._sum.amount ?? 0);

  return totalCashIn - totalCashOut;
}
