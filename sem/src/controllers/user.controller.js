import userService from "../services/user.service.js";
import { updateProfileSchema } from "../utils/validators/user.validator.js";

const userController = {

  async getCurrentUser(req, res, next) {
    try {
  
      const user = await userService.getCurrentUser(
        req.user.userId
      );
  
      res.status(200).json({
        success: true,
        data: user
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  
  async getAccountInfo(req, res, next) {
    try {
  
      const data = await userService.getAccountInfo(
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
  
  
  async updateProfile(req, res, next) {
    try {
  
      const data = updateProfileSchema.parse(req.body);
  
      const user = await userService.updateProfile(
        req.user.userId,
        data
      );
  
      res.status(200).json({
        success: true,
        message: "Profile updated",
        data: user
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  
  async deleteAccount(req, res, next) {
    try {
  
      await userService.deleteAccount(
        req.user.userId,
        req.body.password
      );
  
      res.status(200).json({
        success: true,
        message: "Account deleted successfully"
      });
  
    } catch (error) {
      next(error);
    }
  }
  
  
  };
  
  export default userController;