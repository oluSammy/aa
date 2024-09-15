import status from "http-status";
import { Response } from "express";
import { IGetUserAuthInfoRequest } from "../types";
import { DatabaseService } from "../services/database";
import { verifyPin } from "../utils";
import sendMail from "../utils/email";
import { rabbitMqChannel } from "../services/rabbitmq/producer";
import { donationQueue } from "../utils/constant";
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
          message: "Insufficient balance, please fund your wallet",
        });
      }

      if (fromWalletId.id === toWalletId) {
        return res.status(status.BAD_REQUEST).json({
          message: "You cannot donate to yourself",
        });
      }

      // rabbitMqChannel.sendToQueue(
      //   donationQueue,
      //   Buffer.from(
      //     JSON.stringify({
      //       fromWalletId: fromWalletId.id,
      //       toWalletId: toWalletId,
      //       amount,
      //       userId: user.id,
      //       email: user.email,
      //       note,
      //       userName: user.firstName
      //     })
      //   )
      // );

      const response = await dbService.transfer(fromWalletId.id, toWalletId, amount);
      if (!response.success) {
        return await sendMail(
          user.firstName,
          user.email,
          "Donation Error",
          `<strong>Donation of ${amount} to ${toWalletId} was not successful</strong>`,
          "Please try again"
        );
      }
      await dbService.saveDonation(fromWalletId.id, toWalletId, amount, note);
      const totalDonations = await dbService.getDonationsByWalletId(fromWalletId.id);

      await sendMail(
        user.firstName,
        user.email,
        "Donation Receipt",
        "<strong>Donation of ${msg.amount} to ${msg.toWalletId} was not successful</strong>",
        "Thank You"
      );

      if (totalDonations.data.length > 1) {
        console.log(`The donator has made multiple donations. So send a mail`);
        await sendMail(
          user.firstName,
          user.email,
          "Appreciation",
          "<strong>Thank you. We sincerely appreciate your kind gesture!</strong>",
          "We sincerely appreciate your kind gesture"
        );
      } else {
        console.log(`The donator has just made an initial donation. Don't send a mail`);
      }

      return res.status(status.OK).json({
        message: "Donation successful",
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
      const donations = await dbService.getAllDonations(
        from as string,
        to as string,
        Number(page),
        Number(limit)
      );

      console.log({ donations });

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
