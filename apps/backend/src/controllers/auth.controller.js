import { loginUser, verifyUserEmail, googleLogin } from "../services/auth.service.js";

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

export async function verifyUserEmailController(req, res, next) {
  try {
    const { token } = req.body;
    const user = await verifyUserEmail(token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user,
    })
  } catch (error) {
    next(error);
  }
}

export async function googleLoginController(req, res, next) {
  try {
    const { id_token } = req.body;
    const user = await googleLogin(id_token);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      ...user,
    });
  } catch (error) {
    next(error);
  }
}