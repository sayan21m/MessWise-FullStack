import { z } from "zod";

// Cash In
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

// Cash Out
export const cashOutSchema = z.object({
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

// Update Transaction
export const updateTransactionSchema = z
  .object({
    category: z
      .string()
      .trim()
      .min(1, "Category cannot be empty")
      .max(50, "Category cannot exceed 50 characters")
      .optional(),

    amount: z
      .number({
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be greater than zero")
      .max(9999999999.99, "Amount is too large")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .nullable()
      .optional(),

    transaction_date: z.string().datetime({ message: "Invalid transaction date" }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field is required" });

// Transaction ID parameters
export const transactionParamsSchema = z.object({
  mess_id: z.string().trim().min(1, "Mess ID is required"),

  tid: z
    .string()
    .regex(/^[1-9]\d*$/, "Invalid transaction ID")
    .transform(Number)
    .pipe(z.number().int().positive()),
});

// Mess ID parameters
export const messParamsSchema = z.object({
  mess_id: z.string().trim().min(1, "Mess ID is required"),
});
