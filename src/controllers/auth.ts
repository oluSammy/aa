import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import status from "http-status";
import { DatabaseService } from "../services/database";
import { Wallet } from "./wallet";
import jwt from "jsonwebtoken";
import { IGetUserAuthInfoRequest } from "../types";
import { rabbitMqChannel } from "../services/rabbitmq/producer";
import { walletCreationQueue } from "../utils/constant";

const dbService = new DatabaseService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password } = req.body;

      // generate password hash
      const hashedPassword = bcrypt.hashSync(password, 12);

      // save user to db
      const user = await dbService.saveNewUser(email, hashedPassword, firstName, lastName);

      // send message to queue so that the wallet will be created
      // rabbitMqChannel.sendToQueue(
      //   walletCreationQueue,
      //   Buffer.from(JSON.stringify({ id: user.id, email: user.email, firstName: user.firstName }))
      // );

      // create a wallet
      const wallet = new Wallet();
      const mewWallet = await wallet.createWallet(user.id);

      res.status(status.CREATED).json({
        message: "User created successfully",
        data: {
          firstName,
          lastName,
          email,
          walletId: mewWallet.id,
        },
      });
    } catch (error) {
      res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "Error creating user",
        error: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      // get user from db
      const user = await dbService.getUserByEmail(email);

      if (!user) {
        return res.status(status.UNAUTHORIZED).json({
          message: "Invalid email or password",
        });
      }

      // compare password
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(status.UNAUTHORIZED).json({
          message: "Invalid email or password",
        });
      }

      // remove password from response object
      user.password = undefined;
      const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      res.status(status.OK).json({
        message: "Login successful",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "Error logging in",
        error: error.message,
      });
    }
  }

  async protectRoute(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
    try {
      let token: string | undefined;

      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return res.status(status.UNAUTHORIZED).json({
          message: "unauthorized",
        });
      }

      const decodedToken: any = jwt.verify(token as string, process.env.JWT_SECRET as string);

      const user = await dbService.getUserByEmail(decodedToken.email);
      req.user = user;

      next();
    } catch (err) {
      return res.status(status.UNAUTHORIZED).json({
        message: "unauthorized",
      });
    }
  }
}
