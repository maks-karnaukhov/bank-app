import express from "express";

import {
    getLoans,
    getLoanById,
} from "../controllers/loanController";

import {
    createLoanPayment,
    getLoanPayments,
} from "../controllers/loanPaymentController";

import {
    authMiddleware,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getLoans
);

router.get(
    "/:id",
    authMiddleware,
    getLoanById
);

router.post(
    "/:id/payments",
    authMiddleware,
    createLoanPayment
);

router.get(
    "/:id/payments",
    authMiddleware,
    getLoanPayments
);

export default router;