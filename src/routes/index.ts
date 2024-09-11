import express from "express";
import authRouter from "./auth";
import walletRouter from "./wallet";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/wallet", walletRouter);

export default router;
