import prisma from "../config/db.js";
import { verifyPassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/token.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "node:crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

  if (!user.password_hash) {
    throw createError("Please login using Google", 401);
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw createError("Invalid email or password", 401);
  }

  if (!user.email_verified) {
    throw createError("Please verify your email before logging in", 403);
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

export async function verifyUserEmail(token) {
  const token_hash = crypto.createHash("sha256").update(token).digest("hex");

  const emailVerification = await prisma.emailVerification.findUnique({
    where: {
      token_hash,
    },
  });

  if (!emailVerification) {
    throw createError("Invalid token", 400);
  }

  if (emailVerification.used_at) {
    throw createError("Token has already been used", 400);
  }

  const now = new Date();

  if (emailVerification.expires_at <= now) {
    throw createError("Verification token has expired", 400);
  }

  const user = await prisma.$transaction(async (tx) => {
    const result = await tx.emailVerification.updateMany({
      where: {
        verification_id: emailVerification.verification_id,
        used_at: null,
        expires_at: {
          gt: now,
        },
      },
      data: {
        used_at: now,
      },
    });

    if (result.count !== 1) {
      throw createError("Token is invalid, expired, or already used", 400);
    }

    return await tx.user.update({
      where: {
        user_id: emailVerification.user_id,
      },
      data: {
        email_verified: true,
      },
    });
  });

  return {
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
    mail: user.mail,
    email_verified: user.email_verified,
  };
}

export async function verifyGoogleToken(id_token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      throw createError("Google email is not verified", 401);
    }

    return {
      google_id: payload.sub,
      mail: payload.email.toLowerCase(),
      first_name: payload.given_name ?? "",
      last_name: payload.family_name ?? "",
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createError("Invalid Google ID token", 401);
  }
}

export async function googleLogin(id_token) {
  const googleUser = await verifyGoogleToken(id_token);

  let user = await prisma.user.findUnique({
    where: {
      google_id: googleUser.google_id,
    },
  });

  if (!user) {
    const existingUser = await prisma.user.findUnique({
      where: {
        mail: googleUser.mail,
      },
    });

    if (existingUser) {
      throw createError(
        "An account already exists with this email. Please login using your password.",
        409
      );
    }

    user = await prisma.user.create({
      data: {
        first_name: googleUser.first_name,
        last_name: googleUser.last_name,
        mail: googleUser.mail,
        google_id: googleUser.google_id,
        email_verified: true,
      },
    });
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
