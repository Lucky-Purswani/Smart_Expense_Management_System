import express from "express";
import analyticsController from "../controllers/analytics.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /analytics/summary
 * @desc    Get overall financial summary including total spent, total received, and wallet balance
 * @access  Private
 */
router.get("/summary", authMiddleware, analyticsController.getFinancialSummary);


/**
 * @route   GET /analytics/window-breakdown
 * @desc    Get spending breakdown grouped by expense windows
 * @access  Private
 */
router.get("/window-breakdown", authMiddleware, analyticsController.getWindowBreakdown);


/**
 * @route   GET /analytics/monthly-spending
 * @desc    Get monthly spending trends for charts
 * @access  Private
 */
router.get("/monthly-spending", authMiddleware, analyticsController.getMonthlySpending);


/**
 * @route   GET /analytics/recent-activity
 * @desc    Get recent transaction activity for dashboard
 * @access  Private
 */
router.get("/recent-activity", authMiddleware, analyticsController.getRecentActivity);


/**
 * @route   GET /analytics/window/:windowId
 * @desc    Get analytics statistics for a specific expense window
 * @access  Private
 */
router.get("/window/:windowId", authMiddleware, analyticsController.getWindowAnalytics);

export default router;