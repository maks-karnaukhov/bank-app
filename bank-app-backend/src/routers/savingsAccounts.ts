import express from "express";

import {
    createSavingsAccount,
    getSavingsAccounts,
} from "../controllers/savingsAccountController";

import {
    authMiddleware,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getSavingsAccounts
);

router.post(
    "/",
    authMiddleware,
    createSavingsAccount
);

export default router;