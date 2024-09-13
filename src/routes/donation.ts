import express from "express";
import validationMiddleware from "../middleware/validationMiddleware";
import { donationSchema } from "../validations";
import { AuthController } from "../controllers/auth";
import { Donation } from "../controllers/donation";

const router = express.Router();
const donation = new Donation();
const auth = new AuthController();

router.post("/", [validationMiddleware(donationSchema)], auth.protectRoute, donation.donate);
router.get("/", auth.protectRoute, donation.getCurrentUserDonations);
router.get("/all", auth.protectRoute, donation.getAllDonations);
router.get("/:id", auth.protectRoute, donation.getOneDonation);

export default router;
