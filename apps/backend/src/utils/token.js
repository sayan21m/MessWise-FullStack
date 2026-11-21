import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export function generateAccessToken(user) {
  if (!ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return jwt.sign({}, ACCESS_SECRET, {
    subject: String(user.user_id),
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token) {
  if (!ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return jwt.verify(token, ACCESS_SECRET, {
    algorithms: ["HS256"],
  });
}
