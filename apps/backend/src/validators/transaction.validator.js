import { z } from "zod";

export const cashInSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "Category cannot be empty")
    .max(50, "Category cannot exceed 50 characters")
    .optional(),

  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than zero")
    .max(9999999999.99, "Amount is too large"),

  description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional(),

  transaction_date: z.string().datetime({ message: "Invalid transaction date" }).optional(),
});
