import express from "express";

import {
    getLoans,
    getLoanById,
    getLoanPaymentSchedule,
} from "../controllers/loanController";

import {
    createLoanPayment,
    getLoanPayments,
} from "../controllers/loanPaymentController";

import {
    enableLoanAutoPaymentController,
    executeLoanAutoPaymentController,
} from "../controllers/loanAutoPaymentController";

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
    "/:id/schedule",
    authMiddleware,
    getLoanPaymentSchedule
);

router.post(
    "/:id/auto-payment",
    authMiddleware,
    enableLoanAutoPaymentController
);

router.post(
    "/:id/auto-payment/execute",
    authMiddleware,
    executeLoanAutoPaymentController
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