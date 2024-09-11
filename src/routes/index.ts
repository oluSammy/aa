import express from "express";
import authRouter from "./auth";
import walletRouter from "./wallet";
import donationRouter from "./donation";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/wallet", walletRouter);
router.use("/donation", donationRouter);

export default router;
