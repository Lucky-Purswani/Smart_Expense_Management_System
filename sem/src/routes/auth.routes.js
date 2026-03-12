import express from "express";
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";


const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user account and generate OTP for verification
 * @access  Public
 */
router.post("/register", authLimiter, authController.register);


/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP sent during registration
 * @access  Public
 */
router.post("/verify-otp", authController.verifyOtp);


/**
 * @route   POST /auth/login
 * @desc    Authenticate user and return access + refresh tokens
 * @access  Public
 */
router.post("/login", authLimiter, authController.login);


/**
 * @route   POST /auth/refresh-token
 * @desc    Generate a new access token using refresh token
 * @access  Public
 */
router.post("/refresh-token", authController.refreshToken);


/**
 * @route   POST /auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post("/logout", authController.logout);


/**
 * @route   POST /auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post("/forgot-password", authLimiter, authController.forgotPassword);


/**
 * @route   POST /auth/reset-password
 * @desc    Reset user password using verified OTP
 * @access  Public
 */
router.post("/reset-password", authController.resetPassword);


/**
 * @route   PATCH /auth/change-password
 * @desc    Change password for logged-in user
 * @access  Private
 */
router.patch(
    "/change-password",
    authMiddleware,
    authController.changePassword
  );
  
export default router;