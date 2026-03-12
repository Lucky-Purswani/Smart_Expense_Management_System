import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import expenseWindowService from "../services/expenseWindow.service.js";

cron.schedule("0 0 * * *", async () => {
  try {

    const today = new Date().getDate();

    const windows = await prisma.expenseWindow.findMany({
      where: {
        resetDay: today
      }
    });

    for (const window of windows) {
      try {
        await expenseWindowService.performWindowReset(window.userId, window.id);
      } catch (error) {
        console.error(`Reset failed for window ${window.id}:`, error.message);
      }
    }

  } catch (error) {
    console.error("Cron job failed:", error.message);
  }
});