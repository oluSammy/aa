import dotenv from 'dotenv';
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { User } from "../models/user";

dotenv.config();

const dbConnection = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User],
    migrations: ["src/migrations/*.ts"],
    namingStrategy: new SnakeNamingStrategy(),
    port: +(process.env.DB_PORT) || 3306,
});

export async function getDatabaseConnection(
    instance: DataSource | null,
): Promise<DataSource> {
    if (!instance || !instance.isInitialized) {

        await dbConnection.initialize();
        console.log(`DataSource initialized.`);
        return dbConnection;
    } else {
        try {
            await instance.query("SELECT 1");
        } catch (error) {
            console.log(`DataSource is stale or disconnected. Re-initializing...`);
            await instance.destroy();
            await instance.initialize();
        }
        return instance;
    }
}

export default dbConnection;