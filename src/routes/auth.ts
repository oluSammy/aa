import express from 'express';
import { getDatabaseConnection } from '../config/dbconfig';
import validationMiddleware from '../middleware/validationMiddleware';
import { signupSchema } from '../validations';

const router = express.Router();

router.post("/login", async (req, res) => {
    await getDatabaseConnection(null);
    res.send("Login route");
})

router.post("/signup", [validationMiddleware(signupSchema)], (req, res) => {
    res.send("Login route");
})

export default router;