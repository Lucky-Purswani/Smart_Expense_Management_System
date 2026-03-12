import authService from "../services/auth.service.js";
import { registerSchema, verifyOtpSchema, loginSchema, logoutSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "../utils/validators/auth.validator.js";

const authController = {

  async register(req, res, next) {
    try {

      // Validate request
      const data = registerSchema.parse(req.body);

      // Call service
      const user = await authService.registerUser(data);

      res.status(201).json({
        success: true,
        message: "User registered successfully. Verify OTP.",
        data: {
          userId: user.id
        }
      });

    } catch (error) {
      next(error);
    }
  },
  
  async verifyOtp(req, res, next) {
    try {
  
      const data = verifyOtpSchema.parse(req.body);
  
      await authService.verifyOtp(data);
  
      res.status(200).json({
        success: true,
        message: "OTP verified successfully"
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  async login(req, res, next) {
    try {
  
      // Validate request
      const data = loginSchema.parse(req.body);
  
      // Call service
      const result = await authService.loginUser(data);
  
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  async refreshToken(req, res, next) {
    try {
  
      const data = refreshTokenSchema.parse(req.body);
  
      const result = await authService.refreshAccessToken(data);
  
      res.status(200).json({
        success: true,
        message: "Token refreshed",
        data: result
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  async logout(req, res, next) {
    try {
      
      const data = logoutSchema.parse(req.body);

      await authService.logoutUser(data.refreshToken);

      res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
  
    } catch (error) {
      next(error);
    }
  },
  

  async forgotPassword(req, res, next) {
    try {
  
      const data = forgotPasswordSchema.parse(req.body);
  
      await authService.forgotPassword(data);
  
      res.status(200).json({
        success: true,
        message: "OTP sent for password reset"
      });
  
    } catch (error) {
      next(error);
    }
  },
  

  async resetPassword(req, res, next) {
    try {
  
      const data = resetPasswordSchema.parse(req.body);
  
      await authService.resetPassword(data);
  
      res.status(200).json({
        success: true,
        message: "Password reset successful"
      });
  
    } catch (error) {
      next(error);
    }
  },
  

  async changePassword(req, res, next) {
    try {
  
      const data = changePasswordSchema.parse(req.body);
  
      await authService.changePassword(
        req.user.userId,
        data
      );
  
      res.status(200).json({
        success: true,
        message: "Password changed successfully"
      });
  
    } catch (error) {
      next(error);
    }
  }
  
  };
  
  export default authController;