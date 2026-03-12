import { prisma } from "../config/prisma.js";
import { matchExpenseWindow } from "../utils/matcher/windowMatcher.util.js";
import ApiError from "../utils/ApiError.js";
import { sendMail } from "../utils/mailer.util.js";

const transactionService = {

  async createTransaction(userId, data) {

    const { amount, note, type, recipient } = data;

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }

    if (type === "DEBIT" && Number(wallet.balance) < amount) {
      throw new ApiError(400, "Insufficient balance");
    }

    const windows = await prisma.expenseWindow.findMany({
      where: { userId, isActive: true }
    });

    const cleanedNote = note?.trim();
    let matchedWindow = await matchExpenseWindow(cleanedNote, windows);

    if (!matchedWindow) {
      matchedWindow = windows.find(w => w.isDefault);
      if (!matchedWindow) {
        throw new ApiError(500, "Default window not found");
      }
    }

    const amountNumber = Number(amount);
    const walletBalance = Number(wallet.balance);
    const newBalance =
      type === "DEBIT"
        ? walletBalance - amountNumber
        : walletBalance + amountNumber;

    const result = await prisma.$transaction(async (tx) => {

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance
        }
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount,
          note,
          type,
          recipient,
          windowId: matchedWindow.id,
          status: "COMPLETED"
        }
      });

      const updatedWindow = await tx.expenseWindow.update({
        where: { id: matchedWindow.id },
        data: {
          spent: {
            increment: amountNumber
          },
          transactionCount: {
            increment: 1
          },
          lastTransaction: new Date()
        }
      });

      return { transaction, updatedWindow };

    });

    /* ---------------- Budget Alert Logic ---------------- */

    if (type === "DEBIT" && matchedWindow.allowance > 0) {

      const updatedWindow = await prisma.expenseWindow.findUnique({
        where: { id: matchedWindow.id }
      });

      const spent = Number(updatedWindow.spent);
      const allowance = Number(updatedWindow.allowance);

      const usage = (spent / allowance) * 100;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (usage >= 100 && !updatedWindow.alert100Sent) {

        await sendMail({
          to: user.email,
          subject: "Budget Limit Exceeded",
          html: `
            <h2>Budget Limit Exceeded</h2>
            <p>You have exceeded the budget for <b>${updatedWindow.name}</b>.</p>
            <p>Allowance: ₹${allowance}</p>
            <p>Spent: ₹${spent}</p>
          `
        });

        await prisma.expenseWindow.update({
          where: { id: updatedWindow.id },
          data: { alert100Sent: true }
        });

      } else if (usage >= 90 && !updatedWindow.alert90Sent) {

        await sendMail({
          to: user.email,
          subject: "Budget Usage Warning (90%)",
          html: `
            <h2>Budget Warning</h2>
            <p>You have used more than <b>90%</b> of your budget for <b>${updatedWindow.name}</b>.</p>
            <p>Allowance: ₹${allowance}</p>
            <p>Spent: ₹${spent}</p>
          `
        });

        await prisma.expenseWindow.update({
          where: { id: updatedWindow.id },
          data: { alert90Sent: true }
        });

      }
    }

    return {
      transaction: result.transaction,
      balance: newBalance
    };
  },
  
  
  async transferMoney(userId, data) {

    const { accountNumber, amount, note } = data;
    const amountNumber = Number(amount);
  
    // Fetch sender wallet
    const senderWallet = await prisma.wallet.findUnique({
      where: { userId }
    });
  
    if (!senderWallet) {
      throw new ApiError(404, "Sender wallet not found");
    }
  
    // Find receiver user
    const receiverUser = await prisma.user.findUnique({
      where: { accountNumber }
    });
  
    if (!receiverUser) {
      throw new ApiError(404, "Receiver account not found");
    }
  
    if (receiverUser.id === userId) {
      throw new ApiError(400, "Cannot transfer to yourself");
    }
  
    // Receiver wallet
    const receiverWallet = await prisma.wallet.findUnique({
      where: { userId: receiverUser.id }
    });
  
    if (!receiverWallet) {
      throw new ApiError(404, "Receiver wallet not found");
    }
  
    // Check balance
    if (Number(senderWallet.balance) < amountNumber) {
      throw new ApiError(400, "Insufficient balance");
    }

    const senderWindows = await prisma.expenseWindow.findMany({
      where: { userId, isActive: true }
    });
    
    const cleanedNote = note?.trim();
    let matchedWindow = await matchExpenseWindow(cleanedNote, senderWindows);
    if (!matchedWindow) {
      matchedWindow = senderWindows.find(w => w.isDefault);
    }
  
    const result = await prisma.$transaction(async (tx) => {
  
      // Debit sender
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: {
          balance: {
            decrement: amountNumber
          }
        }
      });
  
      // Credit receiver
      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data: {
          balance: {
            increment: amountNumber
          }
        }
      });

      const senderDefaultWindow = await tx.expenseWindow.findFirst({
        where: {
          userId,
          isDefault: true
        }
      });
      
      const receiverDefaultWindow = await tx.expenseWindow.findFirst({
        where: {
          userId: receiverUser.id,
          isDefault: true
        }
      });
  
      // Sender transaction
      await tx.transaction.create({
        data: {
          userId,
          amount: amountNumber,
          type: "DEBIT",
          note,
          recipient: receiverUser.name,
          windowId: matchedWindow.id
        }
      });
  
      // Find receiver window
      const receiverWindows = await tx.expenseWindow.findMany({
        where: { userId: receiverUser.id, isActive: true }
      });
      const receiverNote = `Received from ${note}`;
      let receiverMatchedWindow = await matchExpenseWindow(receiverNote, receiverWindows);
      if (!receiverMatchedWindow) {
        receiverMatchedWindow = receiverWindows.find(w => w.isDefault);
      }

      // Receiver transaction
      await tx.transaction.create({
        data: {
          userId: receiverUser.id,
          amount: amountNumber,
          type: "CREDIT",
          note: receiverNote,
          recipient: "SELF",
          windowId: receiverMatchedWindow.id
        }
      });

      // window update
      await tx.expenseWindow.update({
        where: { id: matchedWindow.id },
        data: {
          spent: {
            increment: amountNumber
          },
          transactionCount: {
            increment: 1
          },
          lastTransaction: new Date()
        }
      });
  
      return true;
  
    });



    /* -------- Budget Alert Logic for Sender -------- */
    const senderDefaultWindow = await prisma.expenseWindow.findFirst({
      where: {
        userId,
        isDefault: true
      }
    });
    if (senderDefaultWindow.allowance > 0) {

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      const updatedWindow = await prisma.expenseWindow.findUnique({
        where: { id: senderDefaultWindow.id }
      });

      const spent = Number(updatedWindow.spent);
      const allowance = Number(updatedWindow.allowance);

      const usage = (spent / allowance) * 100;

      if (usage >= 100 && !updatedWindow.alert100Sent) {

        await sendMail({
          to: user.email,
          subject: "Budget Limit Exceeded",
          html: `
            <h2>Budget Limit Exceeded</h2>
            <p>You have exceeded your budget for <b>${updatedWindow.name}</b>.</p>
            <p>Allowance: ₹${allowance}</p>
            <p>Spent: ₹${spent}</p>
          `
        });

        await prisma.expenseWindow.update({
          where: { id: updatedWindow.id },
          data: { alert100Sent: true }
        });

      } else if (usage >= 90 && !updatedWindow.alert90Sent) {

        await sendMail({
          to: user.email,
          subject: "Budget Usage Warning (90%)",
          html: `
            <h2>Budget Warning</h2>
            <p>You have used more than <b>90%</b> of your budget for <b>${updatedWindow.name}</b>.</p>
            <p>Allowance: ₹${allowance}</p>
            <p>Spent: ₹${spent}</p>
          `
        });

        await prisma.expenseWindow.update({
          where: { id: updatedWindow.id },
          data: { alert90Sent: true }
        });

      }
    }
  
    return result;
  },
  
  
  async getTransactions(userId, query) {

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
  
    const skip = (page - 1) * limit;
  
    const filter = {
      userId
    };
  
    if (query.windowId) {
      filter.windowId = query.windowId;
    }
  
    const transactions = await prisma.transaction.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    });
  
    const total = await prisma.transaction.count({
      where: filter
    });
  
    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  
  
  async getTransactionById(userId, transactionId) {

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId
      }
    });
  
    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }
  
    return transaction;
  },
  
  
  async getTransactionsByWindow(userId, windowId) {

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        windowId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  
    return transactions;
  },
  
  
    async getRecentTransactions(userId) {

      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      });
    
      return transactions;
    }
  
  };
  
  export default transactionService;