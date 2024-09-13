import dotenv from "dotenv";
import { CannotConnectAlreadyConnectedError, DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { User } from "../models/user";
import { Wallet } from "../models/wallet";
import { Donation } from "../models/donations";

dotenv.config();

const dbConnection = new DataSource({
  type: "mysql",
  host: "localhost",
  username: "root",
  password: "localhost",
  database: "fastmoni",
  entities: [User, Wallet, Donation],
  migrations: ["src/migrations/*.ts"],
  namingStrategy: new SnakeNamingStrategy(),
  port: 3306,
  logging: true,
});

let instance: DataSource | null = null;

export async function getDatabaseConnection(): Promise<DataSource> {
  if (!instance) {
    instance = await dbConnection.initialize();
  } else if (!instance.isInitialized) {
    try {
      await instance.initialize();
    } catch (error) {
      if (error instanceof CannotConnectAlreadyConnectedError) {
        console.log("DataSource is already connected. Using existing connection.");
      } else {
        throw error;
      }
    }
  } else {
    try {
      await instance.query("SELECT 1");
    } catch (error) {
      console.log(`DataSource is stale or disconnected. Re-initializing...`);
      await instance.destroy();
      await instance.initialize();
    }
  }
  return instance;
}
export default dbConnection;
