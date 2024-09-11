import { getDatabaseConnection } from "../../config/dbconfig";
import { User } from "../../models/user";

export class DatabaseService {
    async saveNewUser(email: string, password: string, firstName: string, lastName: string) {
        const dataSource = await getDatabaseConnection()
        await dataSource.getRepository(User).save({
            firstName,
            email,
            lastName,
            password
        })
    }

    async getUserByEmail(email: string) {
        const dataSource = await getDatabaseConnection()
        return await dataSource.getRepository(User).findOne({
            where: {
                email
            }
        })
    }

    async getUserById(id: number) {
        const dataSource = await getDatabaseConnection()
        return await dataSource.getRepository(User).findOne({
            where: {
                id
            }
        })
    }
}