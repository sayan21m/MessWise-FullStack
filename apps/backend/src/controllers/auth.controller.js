import { loginUser } from "../services/auth.service.js";

export async function loginUserController(req, res, next) {
  try {
    const user = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      ...user,
    });
  } catch (error) {
    next(error);
  }
}
