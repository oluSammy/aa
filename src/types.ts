import { User } from "./models/user";
import { Request } from "express";

export interface IGetUserAuthInfoRequest extends Request {
  user: User;
}
