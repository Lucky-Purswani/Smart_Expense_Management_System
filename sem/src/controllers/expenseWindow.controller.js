import { updateWindowSchema, windowIdSchema, createWindowSchema, addLabelsSchema, removeLabelsSchema } from "../utils/validators/expenseWindow.validator.js";
import expenseWindowService from "../services/expenseWindow.service.js";

const expenseWindowController = {

    async getAllWindows(req, res, next) {
      try {
    
        const windows =
          await expenseWindowService.getAllWindows(
            req.user.userId
          );
    
        res.status(200).json({
          success: true,
          data: windows
        });
    
      } catch (error) {
        next(error);
      }
    },
  
    async getWindowById(req, res, next) {
      try {
    
        const { id } = windowIdSchema.parse(req.params);
    
        const window =
          await expenseWindowService.getWindowById(
            req.user.userId,
            id
          );
    
        res.status(200).json({
          success: true,
          data: window
        });
    
      } catch (error) {
        next(error);
      }
    },
  

    async createWindow(req, res, next) {
      try {

        const data = createWindowSchema.parse(req.body);

        const window =
          await expenseWindowService.createWindow(
            req.user.userId,
            data
          );

        res.status(201).json({
          success: true,
          message: "Expense window created",
          data: window
        });

      } catch (error) {
        next(error);
      }
    },
  

    async updateWindow(req, res, next) {
      try {

        const data = updateWindowSchema.parse(req.body);

        const window =
          await expenseWindowService.updateWindow(
            req.user.userId,
            req.params.id,
            data
          );

        res.status(200).json({
          success: true,
          message: "Window updated",
          data: window
        });

      } catch (error) {
        next(error);
      }
    },
  
    async deleteWindow(req, res, next) {
      try {
    
        await expenseWindowService.deleteWindow(
          req.user.userId,
          req.params.id
        );
    
        res.status(200).json({
          success: true,
          message: "Window deleted successfully"
        });
    
      } catch (error) {
        next(error);
      }
    },
  

    async addLabels(req, res, next) {
      try {

        const data = addLabelsSchema.parse(req.body);

        const window = await expenseWindowService.addLabels(
          req.user.userId,
          req.params.id,
          data
        );

        res.status(200).json({
          success: true,
          message: "Labels added successfully",
          data: window
        });

      } catch (error) {
        next(error);
      }
    },
  
    async removeLabels(req, res, next) {
      try {

        const data = removeLabelsSchema.parse(req.body);

        const window = await expenseWindowService.removeLabels(
          req.user.userId,
          req.params.id,
          data
        );

        res.status(200).json({
          success: true,
          message: "Labels removed successfully",
          data: window
        });

      } catch (error) {
        next(error);
      }
    },
    async resetWindow(req, res, next) {
      try {

        const { resetDay } = req.body;

        const result = await expenseWindowService.resetWindow(
          req.user.userId,
          req.params.id,
          resetDay
        );

        res.status(200).json({
          success: true,
          message: result
        });

      } catch (error) {
        next(error);
      }
    }
  
  };
  
  export default expenseWindowController;