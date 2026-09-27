import express from "express";

import {
    createLoanApplication,
    getLoanApplication,
} from "../controllers/loanApplicationController";

import {
    authMiddleware,
} from "../middleware/authMiddleware";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createLoanApplication
);

router.get(
    "/:id",
    authMiddleware,
    getLoanApplication
);

export default router;