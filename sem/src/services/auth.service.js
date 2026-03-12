import { prisma } from "../config/prisma.js";
import { hashPassword } from "../utils/crypto/password.util.js";
import { generateAccountNumber } from "../utils/generators/accountNumber.util.js";
import { generateOtp, getOtpExpiry } from "../utils/crypto/otp.util.js";
import { comparePassword } from "../utils/crypto/password.util.js";
import { verifyRefreshToken, verifyAccessToken } from "../utils/token/jwt.util.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/token/jwt.util.js";
import { sendMail } from "../utils/mailer.util.js";
import ApiError from "../utils/ApiError.js";

const authService = {

    async registerUser(data) {

        const { name, email, phone, password } = data;
    
        // Check existing email
        // Check existing email
        const existingEmail = await prisma.user.findUnique({
          where: { email }
        });

        if (existingEmail) {

          // Check if account already verified
          const verifiedOtp = await prisma.userOTP.findFirst({
            where: {
              userId: existingEmail.id,
              verified: true
            }
          });

          if (verifiedOtp) {
            throw new ApiError(409, "Email already registered");
          }

          // Account exists but NOT verified → send new OTP
          const otpCode = generateOtp();
          const expiresAt = getOtpExpiry();

          await prisma.userOTP.deleteMany({
            where: {
              userId: existingEmail.id,
              verified: false
            }
          });

          await prisma.userOTP.create({
            data: {
              userId: existingEmail.id,
              otpCode,
              expiresAt
            }
          });

          await sendMail({
            to: email,
            subject: "Verify Your Account - OTP",
            html: `
              <h2>Your OTP Code</h2>
              <h1>${otpCode}</h1>
              <p>This OTP expires in 10 minutes.</p>
            `
          });

          return existingEmail;
        }
    
        // Check existing phone
        const existingPhone = await prisma.user.findUnique({
          where: { phone }
        });
    
        if (existingPhone) {
          throw new ApiError(409, "Phone already registered");
        }
    
        // Hash password
        const passwordHash = await hashPassword(password);
    
        // Generate account number
        const accountNumber = generateAccountNumber();
    
        // Generate OTP
        const otpCode = generateOtp();
        const expiresAt = getOtpExpiry();
    
        // DB Transaction
        const result = await prisma.$transaction(async (tx) => {
    
          // Create user
          const user = await tx.user.create({
            data: {
              name,
              email,
              phone,
              passwordHash,
              accountNumber,
              accountHolderName: name
            }
          });
    
          // Create wallet
          await tx.wallet.create({
            data: {
              userId: user.id,
              balance: 10000
            }
          });
    
          // Create default expense window
          await tx.expenseWindow.create({
            data: {
              userId: user.id,
              name: "Default",
              labels: [],
              allowance: 0,
              spent: 0,
              color: "gray",
              isDefault: true
            }
          });
    
          // Store OTP
          await tx.userOTP.create({
            data: {
              userId: user.id,
              otpCode,
              expiresAt
            }
          });
    
          return user;
    
        });
    
        // Console log OTP instead of email
        // console.log("OTP for verification:", otpCode);
        await sendMail({
          to: email,
          subject: "Verify Your Account - OTP",
          html: `
            <h2>Your OTP Code</h2>
            <p>Your verification OTP is:</p>
            <h1>${otpCode}</h1>
            <p>This OTP expires in 10 minutes.</p>
          `
        });
    
        return result;
    },
  
  
    async verifyOtp(data) {

      const { userId, otp } = data;
    
      // Fetch OTP record
      const otpRecord = await prisma.userOTP.findFirst({
        where: {
          userId,
          otpCode: otp,
          verified:false
        }
      });
    
      if (!otpRecord) {
        throw new ApiError(400, "Invalid OTP");
      }
    
      // Check expiry
      if (otpRecord.expiresAt < new Date()) {
        throw new ApiError(400, "OTP expired");
      }
    
      // Check if already verified
      if (otpRecord.verified) {
        throw new ApiError(400, "OTP already used");
      }
    
      // Mark OTP verified
      await prisma.userOTP.update({
        where: { id: otpRecord.id },
        data: {
          verified: true
        }
      });
    
      return true;
    },
  
  
    async loginUser(data) {

      const { email, password } = data;
    
      // Find user
      const user = await prisma.user.findFirst({
        where: {
          email,
          isDeleted: false
        }
      });
    
      if (!user) {
        throw new ApiError(401, "Invalid email or password");
      }
    
      // Verify password
      const validPassword = await comparePassword(password, user.passwordHash);
    
      if (!validPassword) {
        throw new ApiError(401, "Invalid email or password");
      }
    
      // Check OTP verification
      const verifiedOtp = await prisma.userOTP.findFirst({
        where: {
          userId: user.id,
          verified: true
        }
      });
    
      if (!verifiedOtp) {
        throw new ApiError(403, "Account not verified. Please verify OTP.");
      }
    
      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id
      });
    
      const refreshToken = generateRefreshToken({
        userId: user.id
      });
    
      // Store refresh token in DB
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });
    
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date()
        }
      });
    
      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          accountNumber: user.accountNumber
        }
      };
    },
  
  
    async refreshAccessToken(data) {

      const { refreshToken } = data;
    
      // Verify JWT
      let decoded;

      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch {
        throw new ApiError(401, "Invalid refresh token");
      }
    
      // Check token exists in DB
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
      });
    
      if (!tokenRecord) {
        throw new ApiError(401, "Invalid refresh token");
      }
    
      // Check expiry
      if (tokenRecord.expiresAt < new Date()) {
        throw new ApiError(401, "Refresh token expired");
      }
    
      // Generate new access token
      const accessToken = generateAccessToken({
        userId: decoded.userId
      });
    
      return { accessToken };
    },
  
  
    async logoutUser(refreshToken) {
      const token = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
      });

      if (!token) {
        throw new ApiError(401, "Invalid refresh token");
      }

      // Delete refresh token
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken
        }
      });
    
      return true;
    },
  
  
    async forgotPassword(data) {

      const { email } = data;
    
      const user = await prisma.user.findUnique({
        where: { email, isDeleted: false }
      });
    
      if (!user) {
        throw new ApiError(404, "User not found");
      }
    
      const otpCode = generateOtp();
      const expiresAt = getOtpExpiry();
    
      await prisma.userOTP.create({
        data: {
          userId: user.id,
          otpCode,
          expiresAt
        }
      });
    
      // console.log("Password Reset OTP:", otpCode);
      await sendMail({
        to: email,
        subject: "Password Reset OTP",
        html: `
          <h2>Password Reset</h2>
          <p>Your OTP for resetting password is:</p>
          <h1>${otpCode}</h1>
          <p>This OTP expires in 10 minutes.</p>
        `
      });
    
      return true;
    },
  
  
    async resetPassword(data) {

      const { email, otp, newPassword } = data;
    
      const user = await prisma.user.findUnique({
        where: { email, isDeleted: false }
      });
    
      if (!user) {
        throw new ApiError(404, "User not found");
      }
    
      const otpRecord = await prisma.userOTP.findFirst({
        where: {
          userId: user.id,
          otpCode: otp, 
          verified:false
        }
      });
    
      if (!otpRecord) {
        throw new ApiError(400, "Invalid OTP");
      }
    
      if (otpRecord.expiresAt < new Date()) {
        throw new ApiError(400, "OTP expired");
      }
      
      if (otpRecord.verified) {
        throw new ApiError(400, "OTP already used");
      }
    
      const passwordHash = await hashPassword(newPassword);
    
      await prisma.$transaction(async (tx) => {
    
        await tx.user.update({
          where: { id: user.id },
          data: {
            passwordHash
          }
        });
    
        await tx.userOTP.update({
          where: { id: otpRecord.id },
          data: {
            verified: true
          }
        });
        
        await tx.refreshToken.deleteMany({
          where: { userId: user.id }
        });
    
      });
    
      return true;
    },
  
  
    async changePassword(userId, data) {

      const { currentPassword, newPassword } = data;
    
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
    
      if (!user) {
        throw new ApiError(404, "User not found");
      }
    
      const validPassword = await comparePassword(
        currentPassword,
        user.passwordHash
      );
    
      if (!validPassword) {
        throw new ApiError(401, "Current password incorrect");
      }

      const samePassword = await comparePassword(newPassword, user.passwordHash);

      if (samePassword) {
        throw new ApiError(400, "New password cannot be same as current password");
      }
      const passwordHash = await hashPassword(newPassword);
        
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash
        }
      });
    
      return true;
    }
  
  };
  
 export default authService;