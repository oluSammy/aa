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
            console.log(err)
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                message: "An error occurred",
            });
        }
    }

    async getCurrentUserDonations(req: IGetUserAuthInfoRequest, res: Response) {
        try {
            const user = req.user;
            const wallet = await dbService.getWalletByUserId(user.id);

            const donations = await dbService.getDonationsByWalletId(wallet.id);

            return res.status(status.OK).json({
                donations,
            });
        } catch (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                message: "An error occurred",
            });
        }
    }
}
