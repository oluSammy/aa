import express from "express";
import { Wallet } from "../controllers/wallet";
import validationMiddleware from "../middleware/validationMiddleware";
import { fundWalletSchema, walletPinSchema } from "../validations";
import { AuthController } from "../controllers/auth";

const router = express.Router();

const wallet = new Wallet();
const auth = new AuthController();

router.get("/", auth.protectRoute, wallet.getWallet);
router.put("/pin", [validationMiddleware(walletPinSchema)], auth.protectRoute, wallet.createPin);
router.post("/fund", [validationMiddleware(fundWalletSchema)], auth.protectRoute, wallet.fundWallet);

export default router;
