import { z } from "zod";

export const createWindowSchema = z.object({

  name: z
    .string()
    .min(2, "Window name required"),

  allowance: z
    .number()
    .min(0, "Allowance cannot be negative")
    .optional(),

  labels: z
    .array(z.string())
    .optional(),

  color: z
    .string()
    .optional()

});

export const windowIdSchema = z.object({
    id: z.string().min(1, "Window ID required")
  });

export const updateWindowSchema = z.object({

    name: z
      .string()
      .min(2)
      .optional(),
  
    allowance: z
      .number()
      .min(0)
      .optional(),

    color: z
      .string()
      .optional()
  
  });

  export const addLabelsSchema = z.object({
    labels: z.array(z.string()).min(1, "At least one label required")
  });

  export const removeLabelsSchema = z.object({
    labels: z.array(z.string()).min(1, "Labels required")
  });