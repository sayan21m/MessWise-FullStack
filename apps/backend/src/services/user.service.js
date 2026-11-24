import prisma from "../config/db.js";
import { hashPassword } from "../utils/password.js";
import crypto from "node:crypto";
import { sendVerificationEmail } from "./email.service.js";

export function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const token_hash = crypto.createHash("sha256").update(token).digest("hex");

  return {
    token,
    token_hash,
  };
}

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function createUser(user_data) {
  const { first_name, last_name, mail, password } = user_data;

  const normalizedMail = mail.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      mail: normalizedMail,
    },
  });

  if (existingUser) {
    throw createError("User already exists", 409);
  }

  const password_hash = await hashPassword(password);

  try {
    const { user, token, verification } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          first_name,
          last_name,
          mail: normalizedMail,
          password_hash,
        },
      });

      const { token, token_hash } = generateVerificationToken();
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 15);

      const verification = await tx.emailVerification.create({
        data: {
          user_id: user.user_id,
          token_hash,
          expires_at,
        },
      });

      return { user, token, verification };
    });

    try {
      await sendVerificationEmail(user.mail, token);

      await prisma.emailVerification.update({
        where: {
          verification_id: verification.verification_id,
        },
        data: {
          email_sent: true,
          email_attempts: { increment: 1 },
          last_email_error: null,
        },
      });
    } catch (emailError) {
      console.error("Verification email failed:", emailError.message);

      await prisma.emailVerification.update({
        where: {
          verification_id: verification.verification_id,
        },
        data: {
          email_attempts: { increment: 1 },
          last_email_error: emailError.message,
        },
      });
    }

    return {
      first_name: user.first_name,
      last_name: user.last_name,
      mail: user.mail,
    };
  } catch (error) {
    if (error.code === "P2002") {
      throw createError("User already exists", 409);
    }

    throw error;
  }
}
