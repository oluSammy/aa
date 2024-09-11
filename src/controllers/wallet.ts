import { User } from "./../models/user";
import { DatabaseService } from "../services/database";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types";

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
        })
      }

      res.status(200).json({
        message: "Pin created successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating pin",
        error: error.message,
      });
    }
  }

  async fundWallet(req: IGetUserAuthInfoRequest, res: Response) {
    const user = req.user;
    const { amount, pin } = req.body;

    const userWallet = await dbService.getWalletByUserId(user.id)
    const decryptedPin = bcrypt.compareSync(pin, userWallet.pin);

    if (!decryptedPin) {
      return res.status(400).json({
        message: "Invalid pin",
      });
    }
    const newBalance = userWallet.balance + amount;

    await dbService.updateWalletBalance(user.id, newBalance)
    res.status(201).json({
      msg: "Wallet funded successfully",
      balance: newBalance,
    })


  }

  async getWallet(req: IGetUserAuthInfoRequest, res: Response){
    const user = req.user;
    const userWallet = await dbService.getWalletByUserId(user.id);
    res.status(200).json({
      balance: userWallet.balance,
      walletId: userWallet.id,
    });
  }
}
