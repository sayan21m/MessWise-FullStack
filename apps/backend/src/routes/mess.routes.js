import { Router } from "express";
import {
  createMessController,
  getAllMessController,
  getMessByIdController,
  sendInvitationController,
  getPendingInvitationsController,
} from "../controllers/mess.controller.js";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import {
  createMessSchema,
  getMessByIdSchema,
  sendInvitationSchema,
} from "../validators/mess.validator.js";

const router = Router();

router.post("/", authenticate, validate(createMessSchema), createMessController);

router.get("/", authenticate, getAllMessController);

router.get("/invitations", authenticate, getPendingInvitationsController);

router.post(
  "/:mess_id/invitations",
  authenticate,
  validate(sendInvitationSchema),
  sendInvitationController
);

router.get("/:mess_id", authenticate, validateParams(getMessByIdSchema), getMessByIdController);

export default router;
