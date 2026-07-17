import { prisma } from '../config/prisma.js'
import ApiError from "../utils/ApiError.js";
import { comparePassword } from "../utils/crypto/password.util.js"


const userService = {

  async getCurrentUser(userId) {

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        accountNumber: true,
        accountHolderName: true,
        createdAt: true
      }
    });
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    
    return user;
  },
  
  
  async getAccountInfo(userId) {
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accountNumber: true,
        accountHolderName: true,
        wallet: {
          select: {
            balance: true
          }
        }
      }
    });
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    
    return {
      accountNumber: user.accountNumber,
      accountHolderName: user.accountHolderName,
      balance: user.wallet?.balance || 0
    };
  },
  
  
  async updateProfile(userId, data) {

    try {
  
      const allowedData = {
        name: data.name,
        phone: data.phone
      };

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: allowedData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          accountNumber: true,
          accountHolderName: true
        }
      });
  
      return updatedUser;
  
    } catch (error) {
  
      if (error.code === "P2025") {
        throw new ApiError(404, "User not found");
      }
  
      throw error;
    }
  },
  
  
  async deleteAccount(userId, password) {

      try {

        const user = await prisma.user.findFirst({
          where: {
            id: userId,
            isDeleted: false
          }
        });

        if (!user) {
          throw new ApiError(404, "User not found");
        }

        // Verify password
        const isValid = await comparePassword(password, user.passwordHash);

        if (!isValid) {
          throw new ApiError(401, "Incorrect password");
        }

        // Soft delete user
        await prisma.user.update({
          where: { id: userId },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        });

        // Remove refresh tokens (logout everywhere)
        await prisma.refreshToken.deleteMany({
          where: { userId }
        });

        return true;

      } catch (error) {

        if (error.code === "P2025") {
          throw new ApiError(404, "User not found");
        }

        throw error;
      }
    }
  
  };
  
  export default userService;