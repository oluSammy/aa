import dotenv from "dotenv";
import { CannotConnectAlreadyConnectedError, DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { User } from "../models/user";
import { Wallet } from "../models/wallet";
import { Donation } from "../models/donations";
import path from "path";

dotenv.config();

const dbConnection = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Wallet, Donation],
  migrations: [path.join(__dirname, "**", "src/migrations/*.{js}")],
  namingStrategy: new SnakeNamingStrategy(),
  port: 16719,
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
