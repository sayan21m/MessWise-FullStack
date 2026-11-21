import prisma from "../config/db.js";
import { verifyPassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/token.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function loginUser(user_data) {
  const { mail, password } = user_data;

  const user = await prisma.user.findUnique({
    where: {
      mail: mail.trim().toLowerCase(),
    },
  });

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw createError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(user);

  return {
    accessToken,
    user: {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      mail: user.mail,
    },
  };
}
