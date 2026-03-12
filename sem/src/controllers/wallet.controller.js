import walletService from "../services/wallet.service.js";

const walletController = {

  async getWallet(req, res, next) {
    try {

      const wallet = await walletService.getWallet(
        req.user.userId
      );

      res.status(200).json({
        success: true,
        data: wallet
      });

    } catch (error) {
      next(error);
    }
  },


  async getWalletBalance(req, res, next) {
    try {

      const balance = await walletService.getWalletBalance(
        req.user.userId
      );

      res.status(200).json({
        success: true,
        data: balance
      });

    } catch (error) {
      next(error);
    }
  },


  async getAccountInfo(req, res, next) {
    try {

      const accountInfo = await walletService.getAccountInfo(
        req.user.userId
      );

      res.status(200).json({
        success: true,
        data: accountInfo
      });

    } catch (error) {
      next(error);
    }
  }

};

export default walletController;