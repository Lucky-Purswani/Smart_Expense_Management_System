import analyticsService from "../services/analytics.service.js";
import { windowAnalyticsSchema } from "../utils/validators/analytics.validator.js";


const analyticsController = {

  async getFinancialSummary(req, res, next) {
    try {
  
      const summary =
        await analyticsService.getFinancialSummary(
          req.user.userId
        );
  
      res.status(200).json({
        success: true,
        data: summary
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  async getWindowBreakdown(req, res, next) {
    try {
  
      const breakdown =
        await analyticsService.getWindowBreakdown(
          req.user.userId
        );
  
      res.status(200).json({
        success: true,
        data: breakdown
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  async getMonthlySpending(req, res, next) {
    try {
  
      const data =
        await analyticsService.getMonthlySpending(
          req.user.userId
        );
  
      res.status(200).json({
        success: true,
        data
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  async getRecentActivity(req, res, next) {
    try {
  
      const data =
        await analyticsService.getRecentActivity(
          req.user.userId
        );
  
      res.status(200).json({
        success: true,
        data
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  async getWindowAnalytics(req, res, next) {
    try {
  
      const { windowId } =
        windowAnalyticsSchema.parse(req.params);
  
      const data =
        await analyticsService.getWindowAnalytics(
          req.user.userId,
          windowId
        );
  
      res.status(200).json({
        success: true,
        data
      });
  
    } catch (error) {
      next(error);
    }
  }
  
  };
  
  export default analyticsController;