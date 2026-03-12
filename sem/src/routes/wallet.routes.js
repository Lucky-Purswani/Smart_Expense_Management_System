import express from "express";
import walletController from "../controllers/wallet.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /wallet
 * @desc    Get wallet details for the logged-in user
 * @access  Private
 */
router.get("/", authMiddleware, walletController.getWallet);


/**
 * @route   GET /wallet/balance
 * @desc    Get current wallet balance of the logged-in user
 * @access  Private
 */
router.get("/balance", authMiddleware, walletController.getWalletBalance);


/**
 * @route   GET /wallet/account
 * @desc    Get financial account information (account number and account holder name)
 * @access  Private
 */
router.get("/account", authMiddleware, walletController.getAccountInfo);

export default router;