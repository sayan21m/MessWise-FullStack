import { createUser } from "../services/user.service.js";

export async function createUserController(req, res) {
  try {
    const user = await createUser(req.body);

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}
