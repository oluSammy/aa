import express from "express";
import validationMiddleware from "../middleware/validationMiddleware";
import { donationSchema } from "../validations";
import { AuthController } from "../controllers/auth";
import { Donation } from "../controllers/donation";

const router = express.Router();
const donation = new Donation();
const auth = new AuthController();

router.post("/", [validationMiddleware(donationSchema)], auth.protectRoute, donation.donate);
router.post("/", auth.protectRoute, donation.donate);

export default router;
