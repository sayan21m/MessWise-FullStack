import express from "express";
import { createUserSchema, loginSchema, verifyEmailSchema, googleLoginSchema } from "../validators/user.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { createUserController } from "../controllers/user.controller.js";
import { loginUserController, verifyUserEmailController, googleLoginController } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", validate(createUserSchema), createUserController);
router.post("/login", validate(loginSchema), loginUserController);
router.post("/verify-email", validate(verifyEmailSchema), verifyUserEmailController);
router.post("/google-login", validate(googleLoginSchema), googleLoginController);

export default router;
