import { z } from "zod";

export const createMessSchema = z.object({
  mess_name: z
    .string({
      required_error: "Mess name is required",
      invalid_type_error: "Mess name must be a string",
    })
    .trim()
    .min(3, "Mess name must contain at least 3 characters")
    .max(50, "Mess name cannot exceed 50 characters"),
});

export const getMessByIdSchema = z.object({
  mess_id: z.string().trim().min(1, "Mess ID is required"),
});

export const sendInvitationSchema = z.object({
  invited_email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),
});

export const acceptInvitationSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Invitation token is required")
    .regex(/^[a-f0-9]{64}$/i, "Invalid invitation token"),
});