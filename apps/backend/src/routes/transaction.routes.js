import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { getMessByIdSchema } from "../validators/mess.validator.js";
import { cashInSchema } from "../validators/transaction.validator.js";
import { cashInController, cashOutController } from "../controllers/transaction.controller.js";

const router = Router();

router.post(
  "/:mess_id/cashin",
  authenticate,
  validate(cashInSchema),
  validateParams(getMessByIdSchema),
  cashInController
);

router.post(
  "/:mess_id/cashout",
  authenticate,
  validate(cashInSchema),
  validateParams(getMessByIdSchema),
  cashOutController
);

export default router;
