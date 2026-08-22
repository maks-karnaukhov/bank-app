import express from "express";

import {
    createSavingsAccount,
    getSavingsAccounts,
    closeSavingsAccount,
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

router.delete(
    "/:id",
    authMiddleware,
    closeSavingsAccount
);

export default router;