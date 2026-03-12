import express from "express";
import transactionController from "../controllers/transaction.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { transactionLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

/**
 * @route   POST /transactions
 * @desc    Create a new transaction (debit or credit) and automatically assign it to an expense window
 * @access  Private
 */
router.post("/", transactionLimiter ,authMiddleware, transactionController.createTransaction);


/**
 * @route   POST /transactions/transfer
 * @desc    Transfer money to another user using account number
 * @access  Private
 */
router.post("/transfer", transactionLimiter ,authMiddleware, transactionController.transferMoney);


/**
 * @route   GET /transactions
 * @desc    Get all transactions for the logged-in user with optional filters
 * @access  Private
 */
router.get("/", authMiddleware, transactionController.getTransactions);


/**
 * @route   GET /transactions/recent
 * @desc    Get the most recent transactions for dashboard display
 * @access  Private
 */
router.get("/recent", authMiddleware, transactionController.getRecentTransactions);


/**
 * @route   GET /transactions/window/:windowId
 * @desc    Get all transactions belonging to a specific expense window
 * @access  Private
 */
router.get("/window/:windowId", authMiddleware, transactionController.getTransactionsByWindow);


/**
 * @route   GET /transactions/:id
 * @desc    Get a specific transaction by ID
 * @access  Private
 */
router.get("/:id", authMiddleware, transactionController.getTransactionById);


export default router;