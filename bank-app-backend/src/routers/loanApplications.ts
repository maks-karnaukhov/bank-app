import express from "express";

import {
    createLoanApplication,
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

export default router;