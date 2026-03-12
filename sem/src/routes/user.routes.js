import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /users/me
 * @desc    Get profile details of the currently logged-in user
 * @access  Private
 */
router.get("/me", authMiddleware, userController.getCurrentUser);

/**
 * @route   GET /users/account
 * @desc    Get user's financial account information (account number and holder name)
 * @access  Private
 */
router.get("/account", authMiddleware, userController.getAccountInfo);

/**
 * @route   PATCH /users/profile
 * @desc    Update user profile information such as name or phone
 * @access  Private
 */
router.patch("/profile", authMiddleware, userController.updateProfile);

/**
 * @route   DELETE /users
 * @desc    Permanently delete the logged-in user's account
 * @access  Private
 */
router.delete("/", authMiddleware, userController.deleteAccount);

export default router;