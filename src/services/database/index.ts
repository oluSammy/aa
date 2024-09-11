import { Between, IsNull } from "typeorm";
import { getDatabaseConnection } from "../../config/dbconfig";
import { User } from "../../models/user";
import { Wallet } from "../../models/wallet";
import { Donation } from "../../models/donations";

export class DatabaseService {
    async saveNewUser(email: string, password: string, firstName: string, lastName: string) {
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(User).save({
            firstName,
            email,
            lastName,
            password,
        });
    }

    async getUserByEmail(email: string) {
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(User).findOne({
            where: {
                email,
            },
        });
    }

    async getUserById(id: number) {
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(User).findOne({
            where: {
                id,
            },
        });
    }

    async createNewWallet(userId: number) {
        const dataSource = await getDatabaseConnection();
        const newWallet = await dataSource.getRepository(Wallet).save({
            balance: 0,
            user: userId,
        });

        return newWallet;
    }

    async updatePinByUserId(userId: number, pin: string) {
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(Wallet).update(
            {
                user: userId,
                pin: IsNull(), // create pin for users who don't have pin only
            },
            {
                pin,
            }
        );
    }

    async updateWalletBalance(userId: number, amount: number) {
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(Wallet).update(
            {
                user: userId,
            },
            {
                balance: amount,
            }
        );
    }

    async getWalletByUserId(userId: number): Promise<Wallet> {
        const dataSource = await getDatabaseConnection();
        const user = await dataSource.query(`SELECT * FROM wallet WHERE user_id = ${userId}`);
        return user[0];
    }

    async transfer(fromAcctId: number, toWalletId: number, amount: number) {
        const dataSource = await getDatabaseConnection();
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const fromWallet = await queryRunner.manager.findOne(Wallet, {
                where: {
                    id: fromAcctId,
                },
            });

            const toWallet = await queryRunner.manager.findOne(Wallet, {
                where: {
                    id: toWalletId,
                },
            });

            if (!toWallet) {
                await queryRunner.rollbackTransaction();
                return {
                    success: false,
                    message: "Recipient wallet not found",
                };
            }

            await queryRunner.manager.update(Wallet, fromAcctId, {
                balance: fromWallet.balance - amount,
            });

            await queryRunner.manager.update(Wallet, toWalletId, {
                balance: toWallet.balance + amount,
            });

            await queryRunner.commitTransaction();
            return {
                success: true,
                balance: fromWallet.balance - amount,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return {
                success: false,
                message: "An error occurred",
            };
        } finally {
            await queryRunner.release();
        }
    }

    async getDonationsByWalletId(walletId: number) {
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(Donation).find({
            where: {
                fromWallet: walletId,
            },
        })
    }

    async getAllDonations(from: string, to: string) {
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(Donation).find({
            where: {
                createdAt: Between(new Date(from), new Date(to))

            }
        });
    }

    async saveDonation(fromWalletId: number, toWalletId: number, amount: number, note: string) {
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(Donation).save({
            fromWallet: fromWalletId,
            amount,
            toWallet: toWalletId,
            note,
        });
    }

    async getOneDonation(donationId: number, currentUserWalletId: number) {
        console.log({
            donationId,
            currentUserWalletId
        })
        const dataSource = await getDatabaseConnection();
        return await dataSource.getRepository(Donation).findOne({
            where: {
                id: donationId,
                fromWallet: currentUserWalletId,
            },
        });
    }
}
