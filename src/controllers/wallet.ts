import { DatabaseService } from "../services/database";
import bcrypt from "bcrypt";
import { Response } from "express";
import { IGetUserAuthInfoRequest } from "../types";
import status from "http-status";

const dbService = new DatabaseService();

export class Wallet {
  createWallet(userId: number) {
    const wallet = dbService.createNewWallet(userId);
    return wallet;
  }

  async createPin(req: IGetUserAuthInfoRequest, res: Response) {
    try {
      const user = req.user;
      const { pin } = req.body;
      const hashedPin = bcrypt.hashSync(pin, 12);

      const response = await dbService.updatePinByUserId(user.id, hashedPin);

      if (response.affected === 0) {
        return res.status(400).json({
          message: "error creating pin or pin already created",
        });
      }

      res.status(status.OK).json({
        message: "Pin created successfully",
      });
    } catch (error) {
      res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "Error creating pin",
        error: error.message,
      });
    }
  }

  async fundWallet(req: IGetUserAuthInfoRequest, res: Response) {
    const user = req.user;
    const { amount, pin } = req.body;

    if (amount < 0) {
      return res.status(status.BAD_REQUEST).json({
        message: "Amount cannot be negative",
      });
    }


    const userWallet = await dbService.getWalletByUserId(user.id);
    const decryptedPin = bcrypt.compareSync(pin, userWallet.pin);

    if (!decryptedPin) {
      return res.status(status.BAD_REQUEST).json({
        message: "Invalid pin",
      });
    }
    const newBalance = userWallet.balance + amount;

    await dbService.updateWalletBalance(user.id, newBalance);
    res.status(status.OK).json({
      msg: "Wallet funded successfully",
      balance: newBalance,
    });
  }

  async getWallet(req: IGetUserAuthInfoRequest, res: Response) {
    const user = req.user;
    const userWallet = await dbService.getWalletByUserId(user.id);
    res.status(status.OK).json({
      balance: userWallet.balance,
      walletId: userWallet.id,
    });
  }
}
