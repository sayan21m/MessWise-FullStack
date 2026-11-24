import { cashIn, cashOut, updateTransaction, getTransactions, getTransactionById, deleteTransaction, getTotalMessBalance } from "../services/transaction.service.js";

export async function cashInController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const transactionData = req.body;
    const cashInRecord = await cashIn(user_id, mess_id, transactionData);

    return res.status(201).json({
      success: true,
      message: "Cash in transaction recorded successfully",
      data: cashInRecord,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

export async function cashOutController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const transactionData = req.body;
    const cashOutRecord = await cashOut(user_id, mess_id, transactionData);

    return res.status(201).json({
      success: true,
      message: "Cash out transaction recorded successfully",
      data: cashOutRecord,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

export async function updateTransactionController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const transaction_id = Number(req.params.tid);
    const transactionData = req.body;
    const updatedTransaction = await updateTransaction(user_id, mess_id, transaction_id, transactionData);

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

export async function getTransactionsController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const transactions = await getTransactions(user_id, mess_id);

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

export async function getTransactionByIdController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const transaction_id = Number(req.params.tid);
    const transaction = await getTransactionById(user_id, mess_id, transaction_id);

    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

export async function deleteTransactionController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const transaction_id = Number(req.params.tid);
    const deletedTransaction = await deleteTransaction(user_id, mess_id, transaction_id);

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: deletedTransaction,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

export async function getTotalMessBalanceController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const totalBalance = await getTotalMessBalance(user_id, mess_id);

    return res.status(200).json({
      success: true,
      message: "Mess balance fetched successfully",
      data: totalBalance,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}