import express from "express";
import { createUserSchema, loginSchema } from "../validators/user.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { createUserController } from "../controllers/user.controller.js";
import { loginUserController } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", validate(createUserSchema), createUserController);
router.post("/login", validate(loginSchema), loginUserController);

export default router;
