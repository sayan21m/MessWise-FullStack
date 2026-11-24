import { cashIn, cashOut } from "../services/transaction.service.js";

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
