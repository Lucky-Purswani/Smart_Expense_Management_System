import { prisma } from "../config/prisma.js"
import ApiError from "../utils/ApiError.js";

const expenseWindowService = {

  async getAllWindows(userId) {

    const windows = await prisma.expenseWindow.findMany({
      where: { userId },
      orderBy: {
        createdAt: "asc"
      }
    });
  
    return windows;
  },
  
  
  async getWindowById(userId, windowId) {

    const window = await prisma.expenseWindow.findFirst({
      where: {
        id: windowId,
        userId
      }
    });
  
    if (!window) {
      throw new ApiError(404, "Window not found");
    }
  
    return window;
  },
  
  
    async createWindow(userId, data) {

          const { name, allowance, labels, color } = data;

          // COUNT user created windows (exclude default)
          const userWindowsCount = await prisma.expenseWindow.count({
            where: {
              userId,
              isDefault: false
            }
          });

          if (userWindowsCount >= 3) {
            throw new ApiError(403, "You can only create up to 3 windows");
          }

          const defaultColors = ["#6c5ce7", "#00d68f", "#ffaa00", "#0984e3", "#e84393", "#00cec9", "#fd79a8", "#ff4757"];
          const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];

          const window = await prisma.expenseWindow.create({
            data: {
              userId,
              name,
              allowance: Number(allowance) || 0,
              labels: labels ?? [],
              spent: 0,
              color: color || randomColor,
              isDefault: false
            }
      });

      return window;
    },
  
  
    async updateWindow(userId, windowId, data) {

      const window = await prisma.expenseWindow.findFirst({
        where: {
          id: windowId,
          userId
        }
      });

      if (!window) {
        throw new ApiError(404, "Window not found");
      }

      if (window.isDefault) {
        throw new ApiError(403, "Default window cannot be modified");
      }

      const newAllowance = data.allowance !== undefined
        ? Number(data.allowance)
        : Number(window.allowance);

      const spent = Number(window.spent);

      const usage = newAllowance > 0 ? (spent / newAllowance) * 100 : 0;

      const updateData = {
        ...data
      };

      if (usage < 90) {
        updateData.alert90Sent = false;
        updateData.alert100Sent = false;
      } 
      else if (usage < 100) {
        updateData.alert100Sent = false;
      }

      const updatedWindow = await prisma.expenseWindow.update({
        where: { id: windowId },
        data: updateData
      });

      return updatedWindow;
    },
  
  
    async deleteWindow(userId, windowId) {

      const window = await prisma.expenseWindow.findFirst({
        where: {
          id: windowId,
          userId
        }
      });
    
      if (!window) {
        throw new ApiError(404, "Window not found");
      }
    
      if (window.isDefault) {
        throw new ApiError(403, "Default window cannot be deleted");
      }
    
      // Find default window
      const defaultWindow = await prisma.expenseWindow.findFirst({
        where: {
          userId,
          isDefault: true
        }
      });
    
      if (!defaultWindow) {
        throw new ApiError(500, "Default window missing");
      }
    
      await prisma.$transaction(async (tx) => {
        const result = await tx.transaction.aggregate({
          where: { windowId, userId },
          _sum: {
            amount: true
          }
        });

        const totalMoved = Number(result._sum.amount || 0);
    
        // Move transactions to default window
        await tx.transaction.updateMany({
          where: {
            windowId,
            userId
          },
          data: {
            windowId: defaultWindow.id
          }
        });
    
        // Delete window
        await tx.expenseWindow.update({
          where: { id: defaultWindow.id },
          data: {
            spent: {
              increment: totalMoved
            }
          }
        });
        await tx.expenseWindow.delete({
          where: { id: windowId }
        });
    
      });
    
      return true;
    },
  
  
    async addLabels(userId, windowId, data) {

      const { labels } = data;
    
      const window = await prisma.expenseWindow.findFirst({
        where: {
          id: windowId,
          userId
        }
      });
    
      if (!window) {
        throw new ApiError(404, "Window not found");
      }
    
      if (window.isDefault) {
        throw new ApiError(403, "Default window cannot be modified");
      }
    
      const updatedLabels = [...new Set([...window.labels, ...labels])];
    
      const updatedWindow = await prisma.expenseWindow.update({
        where: { id: windowId },
        data: {
          labels: updatedLabels
        }
      });
    
      return updatedWindow;
    },
  
  
    async removeLabels(userId, windowId, data) {

      const { labels } = data;
    
      const window = await prisma.expenseWindow.findFirst({
        where: {
          id: windowId,
          userId
        }
      });
    
      if (!window) {
        throw new ApiError(404, "Window not found");
      }

      if (window.isDefault) {
        throw new ApiError(403, "Default window cannot be modified");
      }
    
      const updatedLabels = window.labels.filter(
        label => !labels.includes(label)
      );
    
      const updatedWindow = await prisma.expenseWindow.update({
        where: { id: windowId },
        data: {
          labels: updatedLabels
        }
      });
    
      return updatedWindow;
    },
    async resetWindow(userId, windowId, resetDay) {
      const window = await prisma.expenseWindow.findFirst({
        where: { id: windowId, userId }
      });

      if (!window) {
        throw new ApiError(404, "Window not found");
      }

      if (window.isDefault) {
        throw new ApiError(400, "Default window cannot be reset");
      }

      // 1. REMOVE SCHEDULE (explicit null)
      if (resetDay === null) {
        await prisma.expenseWindow.update({
          where: { id: windowId },
          data: { resetDay: null }
        });
        return "Reset schedule removed";
      }

      // 2. SET/UPDATE SCHEDULE (number)
      if (typeof resetDay === "number") {
        if (resetDay < 1 || resetDay > 28) {
          throw new ApiError(400, "resetDay must be between 1 and 28");
        }
        await prisma.expenseWindow.update({
          where: { id: windowId },
          data: { resetDay }
        });
        return "Monthly reset scheduled";
      }

      // 3. INSTANT RESET (undefined)
      await this.performWindowReset(userId, windowId);
      return "Window reset successfully";
    },

    async performWindowReset(userId, windowId) {
      await prisma.expenseWindow.update({
        where: { id: windowId },
        data: {
          spent: 0,
          transactionCount: 0,
          lastTransaction: null,
          alert90Sent: false,
          alert100Sent: false
        }
      });
    }
  
  };
  
  export default expenseWindowService;