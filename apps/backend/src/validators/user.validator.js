import { z } from "zod";

export const createUserSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "First name must contain at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),

  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),

  mail: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
});

export const loginSchema = z.object({
  mail: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, "Verification token is required"),
});

export const googleLoginSchema = z.object({
  id_token: z.string().trim().min(1, "Google ID token is required"),
});