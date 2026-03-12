import { z } from "zod";

export const createTransactionSchema = z.object({

  amount: z
    .coerce
    .number()
    .positive("Amount must be greater than 0"),

  note: z
    .string()
    .min(1, "Transaction note is required")
    .max(120),

  type: z.enum(["DEBIT", "CREDIT"]),

  recipient: z
    .string()
    .optional()

});


export const transferMoneySchema = z.object({

  accountNumber: z
    .string()
    .min(5, "Account number required"),

  amount: z
    .coerce
    .number()
    .positive("Amount must be greater than 0"),

  note: z
    .string()
    .min(1, "Note is required")
    .max(120)

});

export const getTransactionsSchema = z.object({

  page: z
    .coerce
    .string()
    .optional(),

  limit: z
    .coerce
    .string()
    .optional(),

  windowId: z
    .string()
    .optional()

});

export const transactionIdSchema = z.object({
  id: z.string().min(1, "Transaction ID required")
});

export const windowTransactionsSchema = z.object({
  windowId: z.string().min(1, "Window ID required")
});