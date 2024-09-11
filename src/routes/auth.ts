import express from "express";
import { getDatabaseConnection } from "../config/dbconfig";
import validationMiddleware from "../middleware/validationMiddleware";
import { loginSchema, signupSchema } from "../validations";
import { AuthController } from "../controllers/auth";

const router = express.Router();
const auth = new AuthController();

router.post("/login", [validationMiddleware(loginSchema)], auth.login);

router.post("/signup", [validationMiddleware(signupSchema)], auth.signup);

export default router;
