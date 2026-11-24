import { Router } from "express";

import { authenticate } from "../middleware/authenticate.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";

import {
  cashInSchema,
  cashOutSchema,
  updateTransactionSchema,
  transactionParamsSchema,
  messParamsSchema,
} from "../validators/transaction.validator.js";

import {
  cashInController,
  cashOutController,
  updateTransactionController,
  getTransactionsController,
  getTransactionByIdController,
  deleteTransactionController,
  getTotalMessBalanceController,
} from "../controllers/transaction.controller.js";

const router = Router();

router.post(
  "/:mess_id/cashin",
  authenticate,
  validateParams(messParamsSchema),
  validate(cashInSchema),
  cashInController
);

router.post(
  "/:mess_id/cashout",
  authenticate,
  validateParams(messParamsSchema),
  validate(cashOutSchema),
  cashOutController
);

router.patch(
  "/:mess_id/:tid/update-transaction",
  authenticate,
  validateParams(transactionParamsSchema),
  validate(updateTransactionSchema),
  updateTransactionController
);

router.get(
  "/:mess_id/all-transactions",
  authenticate,
  validateParams(messParamsSchema),
  getTransactionsController
);

router.get(
  "/:mess_id/total-balance",
  authenticate,
  validateParams(messParamsSchema),
  getTotalMessBalanceController
);

router.get(
  "/:mess_id/:tid",
  authenticate,
  validateParams(transactionParamsSchema),
  getTransactionByIdController
);

router.delete(
  "/:mess_id/:tid",
  authenticate,
  validateParams(transactionParamsSchema),
  deleteTransactionController
);

export default router;
