import { Request, Response } from "express";
import bcrypt from "bcrypt";
import status from "http-status"
import { DatabaseService } from "../services/database";

const dbService = new DatabaseService()

export class AuthController {
    async signup(req: Request, res: Response) {
        try {
            const { firstName, lastName, email, password } = req.body

            // generate password hash
            const hashedPassword = bcrypt.hashSync(password, 12);

            // save user to db
            await dbService.saveNewUser(email, hashedPassword, firstName, lastName)

            res.status(status.CREATED).json({
                message: "User created successfully",
                data: {
                    firstName,
                    lastName,
                    email,
                    hashedPassword
                }
            })
        } catch (error) {
            res.status(status.INTERNAL_SERVER_ERROR).json({
                message: "Error creating user",
                error: error.message
            })
        }

    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body

            // get user from db
            const user = await dbService.getUserByEmail(email)

            if (!user) {
                return res.status(status.UNAUTHORIZED).json({
                    message: "Invalid email or password"
                })
            }

            // compare password
            const isPasswordValid = bcrypt.compareSync(password, user.password)

            if (!isPasswordValid) {
                return res.status(status.UNAUTHORIZED).json({
                    message: "Invalid email or password"
                })
            }

            // remove password from response object
            user.password = undefined
            res.status(status.OK).json({
                message: "Login successful",
                data: {
                    user
                }
            })
        } catch (error) {
            res.status(status.INTERNAL_SERVER_ERROR).json({
                message: "Error logging in",
                error: error.message
            })
        }

    }
}