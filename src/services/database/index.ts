import { IsNull } from "typeorm";
import { getDatabaseConnection } from "../../config/dbconfig";
import { User } from "../../models/user";
import { Wallet } from "../../models/wallet";

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
        const user = await dataSource.query(`SELECT * FROM wallet WHERE user_id = ${userId}`)
        return user[0];
    }
}
