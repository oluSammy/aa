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
    const dataSource = await getDatabaseConnection();
    const RowsLimit = limit ? limit : 100
    const currentPage = page ? page : 1
    const skip = (currentPage - 1) * RowsLimit;

    const currentData = await dataSource.query(`
      SELECT * FROM donation WHERE from_wallet_id = ${walletId} LIMIT ${RowsLimit} OFFSET ${skip}
    `);

    return {
      data: currentData.map((donation) => {
        return {
          ...donation,
          note: donation.note.split(":::")[0],
        };
      }),
    };
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
    const total = await dataSource
      .getRepository(model)
      .createQueryBuilder("entity")
      .where({ ...query })
      .getCount();

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

    return {
      total, // The total number of records that match the query
      page: currentPage, // The current page number
      currentTotal: currentData.length, // The number of records returned for the current page
      data: currentData, // The actual paginated data
    };
  }

  async getAllDonations(from?: string, to?: string, page?: number, limit?: number) {
    const today = new Date(Date.now());
    const month = `${today.getMonth() + 1}`.padStart(2, "0");
    const day = `${today.getDate()}`.padStart(2, "0");

    // set default startDate and endDate
    const endDate = to ?? `${today.getFullYear()}-${month}-${day}`;
    const startDate = from ?? "2024-08-09";

    const donations = await this.paginate(
      Donation,
      {
        createdAt: Between(new Date(startDate), new Date(`${endDate} 23:59:59`)), //add 23:59:59 to query until the end of the day
      },
      limit,
      page
    );

    const mappedData = donations.data.map((donation) => {
      const currentNote = donation.note.split(":::");
      return {
        ...donation,
        note: currentNote[0],
        SenderWalletId: currentNote[1],
        ReceiverWalletId: currentNote[2],
      };
    });
    return { ...donations, data: mappedData };
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
      note: `${note}:::${fromWalletId}:::${toWalletId}`,
    });
  }

  async getOneDonation(donationId: number, currentUserWalletId: number) {
    const dataSource = await getDatabaseConnection();
    const donation = await dataSource.getRepository(Donation).findOne({
      where: {
        id: donationId,
        fromWallet: currentUserWalletId,
      },
    });

    const currentNote = donation.note.split(":::");
    return {
      ...donation,
      note: currentNote[0],
      SenderWalletId: currentNote[1],
      ReceiverWalletId: currentNote[2],
    };
  }
}
