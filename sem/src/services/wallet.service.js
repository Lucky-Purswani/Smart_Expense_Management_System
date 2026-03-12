import { prisma } from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const walletService = {

  async getWallet(userId) {

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }

    return wallet;
  },


  async getWalletBalance(userId) {

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        balance: true
      }
    });

    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }

    return wallet;
  },


  async getAccountInfo(userId) {

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accountNumber: true,
        accountHolderName: true
      }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

};

export default walletService;