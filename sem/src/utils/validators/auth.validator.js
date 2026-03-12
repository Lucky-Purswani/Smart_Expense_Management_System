import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});

export const verifyOtpSchema = z.object({
  userId: z
    .string()
    .min(1, "User ID is required"),

  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required")
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token required")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email")
});

export const resetPasswordSchema = z.object({

  email: z.string().email("Invalid email"),

  otp: z
    .string()
    .length(6, "OTP must be 6 digits"),

  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")

});

export const changePasswordSchema = z.object({

  currentPassword: z
    .string()
    .min(6, "Current password required"),

  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")

});