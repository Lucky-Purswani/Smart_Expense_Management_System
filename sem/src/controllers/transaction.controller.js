import transactionService from "../services/transaction.service.js";
import { createTransactionSchema, transferMoneySchema, getTransactionsSchema, transactionIdSchema, windowTransactionsSchema } from "../utils/validators/transaction.validator.js";

const transactionController = {

  
  async createTransaction(req, res, next) {
    try {
  
      const data = createTransactionSchema.parse(req.body);
  
      const result = await transactionService.createTransaction(
        req.user.userId,
        data
      );
  
      res.status(201).json({
        success: true,
        message: "Transaction created",
        data: result
      });
  
    } catch (error) {
      next(error);
    }
  },
  

  async transferMoney(req, res, next) {
    try {

      const data = transferMoneySchema.parse(req.body);

      await transactionService.transferMoney(
        req.user.userId,
        data
      );

      res.status(200).json({
        success: true,
        message: "Transfer successful"
      });

    } catch (error) {
      next(error);
    }
  },
  
  async getTransactions(req, res, next) {
    try {
  
      const query = getTransactionsSchema.parse(req.query);
  
      const result = await transactionService.getTransactions(
        req.user.userId,
        query
      );
  
      res.status(200).json({
        success: true,
        data: result
      });
  
    } catch (error) {
      next(error);
    }
  },
  
  async getTransactionById(req, res, next) {
    try {
  
      const { id } = transactionIdSchema.parse(req.params);
  
      const transaction =
        await transactionService.getTransactionById(
          req.user.userId,
          id
        );
  
      res.status(200).json({
        success: true,
        data: transaction
      });
  
    } catch (error) {
      next(error);
    }
  },
  

  async getTransactionsByWindow(req, res, next) {
    try {
  
      const { windowId } =
        windowTransactionsSchema.parse(req.params);
  
      const transactions =
        await transactionService.getTransactionsByWindow(
          req.user.userId,
          windowId
        );
  
      res.status(200).json({
        success: true,
        data: transactions
      });
  
    } catch (error) {
      next(error);
    }
  },
  
    async getRecentTransactions(req, res, next) {
      try {
    
        const transactions =
          await transactionService.getRecentTransactions(
            req.user.userId
          );
    
        res.status(200).json({
          success: true,
          data: transactions
        });
    
      } catch (error) {
        next(error);
      }
    }
  
  };
  
  export default transactionController;