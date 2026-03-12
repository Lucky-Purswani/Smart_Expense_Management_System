import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
    .optional()
});