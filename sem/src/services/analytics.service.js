import { prisma } from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const analyticsService = {


  async getFinancialSummary(userId) {
  
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }
  
    const totalSpent = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "DEBIT"
      }
    });
  
    const totalReceived = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "CREDIT"
      }
    });
  
    const totalTransactions = await prisma.transaction.count({
      where: { userId }
    });


    
    return {
      walletBalance: wallet.balance,
      totalSpent: totalSpent._sum.amount || 0,
      totalReceived: totalReceived._sum.amount || 0,
      totalTransactions
    };
  },
  
  
  async getWindowBreakdown(userId) {

    const result = await prisma.transaction.groupBy({
      by: ["windowId"],
      where: {
        userId,
        type: "DEBIT"
      },
      _sum: {
        amount: true
      }
    });
  
    const windows = await prisma.expenseWindow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true
      }
    });
  
    const breakdown = result.map(item => {
      const window = windows.find(w => w.id === item.windowId);
  
      return {
        windowId: item.windowId,
        windowName: window?.name || "Unknown",
        spent: item._sum.amount || 0
      };
    });
  
    return breakdown;
  },
  
  
  async getMonthlySpending(userId) {

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "DEBIT"
      },
      select: {
        amount: true,
        createdAt: true
      }
    });
  
    const monthlyMap = {};
  
    transactions.forEach(t => {
      const date = new Date(t.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
  
      if (!monthlyMap[key]) {
        monthlyMap[key] = 0;
      }
  
      monthlyMap[key] += t.amount;
    });
  
    return Object.keys(monthlyMap).map(key => ({
      month: key,
      spent: monthlyMap[key]
    }));
  },
  
  
  async getRecentActivity(userId) {

    const transactions = await prisma.transaction.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });
  
    return transactions;
  },
  
  
  async getWindowAnalytics(userId, windowId) {

    const window = await prisma.expenseWindow.findFirst({
      where: {
        id: windowId,
        userId
      }
    });
  
    if (!window) {
      throw new ApiError(404, "Window not found");
    }
  
    const totalSpent = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        windowId,
        type: "DEBIT"
      }
    });
  
    const transactionCount = await prisma.transaction.count({
      where: {
        userId,
        windowId
      }
    });
  
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        windowId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });
  
    return {
      windowId,
      windowName: window.name,
      allowance: window.allowance,
      spent: totalSpent._sum.amount || 0,
      transactionCount,
      recentTransactions
    };
  }
  
  };
  
  export default analyticsService;