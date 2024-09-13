import status from "http-status";
import { Response } from "express";
import { IGetUserAuthInfoRequest } from "../types";
import { DatabaseService } from "../services/database";
import { verifyPin } from "../utils";

const dbService = new DatabaseService();

export class Donation {
  async donate(req: IGetUserAuthInfoRequest, res: Response) {
    try {
      const user = req.user;
      const { toWalletId, amount, pin, note } = req.body;

      if (amount < 0) {
        return res.status(status.BAD_REQUEST).json({
          message: "Amount cannot be negative",
        });
      }

      const fromWalletId = await dbService.getWalletByUserId(user.id);
      const isValidPin = verifyPin(pin, fromWalletId.pin);

      if (!isValidPin) {
        return res.status(status.BAD_REQUEST).json({
          message: "Invalid pin",
        });
      }

      if (fromWalletId.balance < amount) {
        return res.status(status.BAD_REQUEST).json({
          message: "Insufficient balance",
        });
      }

      if (fromWalletId.id === toWalletId) {
        return res.status(status.BAD_REQUEST).json({
          message: "You cannot donate to yourself",
        });
      }

      const response = await dbService.transfer(fromWalletId.id, toWalletId, amount);

      if (!response.success) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
          message: response.message,
        });
      }

      await dbService.saveDonation(fromWalletId.id, toWalletId, amount, note);

      return res.status(status.OK).json({
        message: "Donation successful",
        balance: response.balance,
      });
    } catch (err) {
      console.log(err);
      return res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred",
      });
    }
  }

  async getCurrentUserDonations(req: IGetUserAuthInfoRequest, res: Response) {
    try {
      const user = req.user;
      const wallet = await dbService.getWalletByUserId(user.id);
      const { page, limit } = req.query;

      const donations = await dbService.getDonationsByWalletId(
        wallet.id,
        Number(page),
        Number(limit)
      );
      return res.status(status.OK).json({
        message: "current user's donations",
        ...donations,
      });
    } catch (error) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred",
      });
    }
  }

  async getAllDonations(req: IGetUserAuthInfoRequest, res: Response) {
    try {
      const { from, to, page, limit } = req.query;
      // console.log({ from, to, page, limit } )
      const donations = await dbService.getAllDonations(
        from as string,
        to as string,
        Number(page),
        Number(limit)
      );
      return res.status(status.OK).json({
        donations,
      });
    } catch (error) {
      console.log(error, "...");
      return res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred...",
      });
    }
  }

  async getOneDonation(req: IGetUserAuthInfoRequest, res: Response) {
    const donationId = req.params.id;

    try {
      const user = req.user.id;

      const userWallet = await dbService.getWalletByUserId(user);
      const donation = await dbService.getOneDonation(Number(donationId), userWallet.id);
      return res.status(status.OK).json({
        donation,
      });
    } catch (error) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred",
      });
    }
  }
}
