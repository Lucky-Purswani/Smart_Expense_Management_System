import express from "express";
import expenseWindowController from "../controllers/expensewindow.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /windows
 * @desc    Get all expense windows for the logged-in user
 * @access  Private
 */
router.get("/", authMiddleware, expenseWindowController.getAllWindows);


/**
 * @route   GET /windows/:id
 * @desc    Get a specific expense window with its details
 * @access  Private
 */
router.get("/:id", authMiddleware, expenseWindowController.getWindowById);


/**
 * @route   POST /windows
 * @desc    Create a new expense window (category with labels and budget)
 * @access  Private
 */
router.post("/", authMiddleware, expenseWindowController.createWindow);


/**
 * @route   PATCH /windows/:id
 * @desc    Update window details such as name, allowance, labels, or color
 * @access  Private
 */
router.patch("/:id", authMiddleware, expenseWindowController.updateWindow);


/**
 * @route   DELETE /windows/:id
 * @desc    Delete an expense window (cannot delete default window)
 * @access  Private
 */
router.delete("/:id", authMiddleware, expenseWindowController.deleteWindow);


/**
 * @route   POST /windows/:id/labels
 * @desc    Add new labels used for automatic transaction classification
 * @access  Private
 */
router.post("/:id/labels", authMiddleware, expenseWindowController.addLabels);


/**
 * @route   DELETE /windows/:id/labels
 * @desc    Remove labels from a window
 * @access  Private
 */
router.delete("/:id/labels", authMiddleware, expenseWindowController.removeLabels);

/**
 * @route POST /windows/:id/reset
 * @desc Reset window now OR schedule monthly reset
 */
router.post("/:id/reset", authMiddleware, expenseWindowController.resetWindow);

export default router;