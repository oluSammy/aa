import {
  Between,
  EntitySchema,
  EntityTarget,
  FindManyOptions,
  FindOptionsWhere,
  In,
  IsNull,
} from "typeorm";
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

  async getDonationsByWalletId(walletId: number, page?: number, limit?: number) {
    const response = await this.paginate<Donation>(
      Donation,
      {
        fromWallet: walletId,
      },
      limit,
      page
    );

    return response;
  }

  /**
   * Paginate results from a TypeORM entity repository.
   *
   * @template T - The entity type.
   * @param {EntityTarget<T>} model - The TypeORM entity class to paginate.
   * @param {FindOptionsWhere<T>} query - The search criteria for filtering the results.
   * @param {number} limit - The number of results per page (optional, defaults to 100).
   * @param {number} page - The current page number (optional, defaults to 1).
   * @returns {Promise<object>} - An object containing the total records, current page number, total on the page, and paginated data.
   */
  private async paginate<T>(
    model: EntityTarget<T>,
    query: FindOptionsWhere<T>,
    limit: number,
    page: number,
    leftJoin?: string[][]
  ) {
    const dataSource = await getDatabaseConnection();

    // If page is not provided, default to 1
    const currentPage = page ? page : 1;

    // If limit is not provided, default to 100
    const take = limit ? limit : 100;

    // Calculate the offset (how many rows to skip based on the current page)
    const skip = (currentPage - 1) * take;

    // Get the total number of records that match the query (without pagination)
    const total = await dataSource.getRepository(model).count(query);

    let queryBuilder = dataSource.getRepository(model).createQueryBuilder("entityAlias");

    if (leftJoin) {
      leftJoin.forEach((join) => {
        queryBuilder = queryBuilder.leftJoinAndSelect(join[0], join[1]);
      });
    }

    const currentData = await queryBuilder
      .where({ ...query })
      .skip(skip)
      .take(take)
      .getMany();

    // console.log(currentData);

    return {
      total, // The total number of records that match the query
      page: currentPage, // The current page number
      currentTotal: currentData.length, // The number of records returned for the current page
      data: currentData, // The actual paginated data
    };
  }

  async getAllDonations(from: string, to: string, page?: number, limit?: number) {
    const donations = await this.paginate(
      Donation,
      {
        createdAt: Between(new Date(from), new Date(to)),
      },
      limit,
      page,
    );
    // [
    //   ["entityAlias.fromWallet", "from_wallet_id"],
    //   ["entityAlias.toWallet", "to_wallet_id"],
    // ]

    // const allDonations = [];

    // donations.data.forEach((donation) => {
    //   allDonations.push({
    //     donation: donation.amount,
    //     note: donation.note,
    //     id: donation.id,
    //     fromWallet: donation.fromWallet,
    //     toWallet: donation.toWallet,
    //   });
    // });

    // const allWalletIds = [];
    // allDonations.forEach((wallet) => {
    //   allWalletIds.push(wallet.fromWallet.id);
    //   allWalletIds.push(wallet.toWallet.id);
    // });
    // const uniqueWallets = [...new Set(allWalletIds)];
    // const wallets = await this.getWalletsByWalletIds(uniqueWallets);

    // const walletMap = wallets.reduce(
    //   (acc, curr) => {
    //     acc[curr.id] = curr.user;
    //     return acc;
    //   },
    //   {} as Record<number, any>
    // );

    // console.log({ walletMap, allDonations });

    // donations.data = allDonations.map((donation) => {
    //   const fromUser = walletMap[donation.fromWallet.id];
    //   const toUser = walletMap[donation.toWallet.id];

    //   return {
    //     ...donation,
    //     fromUser: { email: fromUser.email, name: `${fromUser.firstName} ${fromUser.lastName}` },
    //     toUser: { email: toUser.email, name: `${toUser.firstName} ${toUser.lastName}` },
    //     fromWallet: donation.fromWallet.id,
    //     toWallet: donation.toWallet.id,
    //   };
    // });

    return donations;
  }

  async getWalletsByWalletIds(walletIds: number[]) {
    const dataSource = await getDatabaseConnection();
    return await dataSource
      .getRepository(Wallet)
      .createQueryBuilder("wallet")
      .where({ id: In(walletIds) })
      .leftJoinAndSelect("wallet.user", "user_id")
      .getMany();
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
      currentUserWalletId,
    });
    const dataSource = await getDatabaseConnection();
    return await dataSource.getRepository(Donation).findOne({
      where: {
        id: donationId,
        fromWallet: currentUserWalletId,
      },
    });
  }
}
