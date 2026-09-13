import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";

import {
    enableLoanAutoPayment,
    executeLoanAutoPayment
} from "../services/loanAutoPaymentService";

import {
    applyCreditRatingEvent,
} from "../services/creditRatingService";

export const enableLoanAutoPaymentController = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const { id } = req.params;
        const { cardId } = req.body;

        if (typeof id !== "string") {
            return res.status(400).json({
                code: "LOAN_ID_REQUIRED",
                message: "Loan ID is required",
            });
        }

        if (!cardId) {
            return res.status(400).json({
                code: "CARD_ID_REQUIRED",
                message: "Card ID is required",
            });
        }

        const autoPayment =
            await enableLoanAutoPayment({
                userId,
                loanId: id,
                cardId,
            });

        return res.status(200).json({
            id: autoPayment._id,
            loanId: autoPayment.loanId,
            cardId: autoPayment.cardId,
            isEnabled: autoPayment.isEnabled,
        });
    } catch (error) {
        console.error(
            "Enable loan auto payment error:",
            error
        );

        if (error instanceof Error && error.message === "LOAN_NOT_FOUND") {
            return res.status(404).json({
                code: "LOAN_NOT_FOUND",
                message: "Loan not found",
            });
        }

        if (error instanceof Error && error.message === "LOAN_NOT_ACTIVE") {
            return res.status(400).json({
                code: "LOAN_NOT_ACTIVE",
                message: "Loan is not active",
            });
        }

        if (error instanceof Error && error.message === "CARD_NOT_FOUND") {
            return res.status(404).json({
                code: "CARD_NOT_FOUND",
                message: "Card not found",
            });
        }

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const executeLoanAutoPaymentController = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                code: "LOAN_ID_REQUIRED",
                message: "Loan ID is required",
            });
        }

        const result =
            await executeLoanAutoPayment({
                userId,
                loanId: id,
            });

        if (!result.wasLate) {
            await applyCreditRatingEvent({
                userId,
                loanId: id,
                type: "PAYMENT_ON_TIME",
            });
        }

        if (result.loanPaid) {
            await applyCreditRatingEvent({
                userId,
                loanId: id,
                type: "LOAN_PAID",
            });
        }

        return res.status(200).json({
            success: result.success,
            payment: {
                id: result.payment._id,
                loanId: result.payment.loanId,
                amount: result.payment.amount,
                principalAmount: result.payment.principalAmount,
                interestAmount: result.payment.interestAmount,
                remainingAmount: result.payment.remainingAmount,
                status: result.payment.status,
                paidAt: result.payment.paidAt,
            },
            loan: {
                id: result.loan._id,
                remainingPrincipal: result.loan.remainingPrincipal,
                remainingAmount: result.loan.remainingAmount,
                status: result.loan.status,
            },
            schedule: {
                id: result.schedule._id,
                installmentNumber: result.schedule.installmentNumber,
                dueDate: result.schedule.dueDate,
                status: result.schedule.status,
            },
            card: {
                id: result.card._id,
                balance: result.card.balance,
            },
            paymentStatus: result.wasLate ? "LATE" : "ON_TIME",
        });
    } catch (error) {
        console.error(
            "Execute loan auto payment error:",
            error
        );

        if (
            error instanceof Error &&
            error.message === "AUTO_PAYMENT_NOT_FOUND"
        ) {
            return res.status(404).json({
                code: "AUTO_PAYMENT_NOT_FOUND",
                message: "Loan auto payment is not enabled",
            });
        }

        if (error instanceof Error && error.message === "LOAN_NOT_FOUND") {
            return res.status(404).json({
                code: "LOAN_NOT_FOUND",
                message: "Loan not found",
            });
        }

        if (error instanceof Error && error.message === "LOAN_NOT_ACTIVE") {
            return res.status(400).json({
                code: "LOAN_NOT_ACTIVE",
                message: "Loan is not active",
            });
        }

        if (error instanceof Error && error.message === "LOAN_ALREADY_PAID") {
            return res.status(400).json({
                code: "LOAN_ALREADY_PAID",
                message: "Loan is already paid",
            });
        }

        if (error instanceof Error && error.message === "CARD_NOT_FOUND") {
            return res.status(404).json({
                code: "CARD_NOT_FOUND",
                message: "Card not found",
            });
        }

        if (error instanceof Error && error.message === "CARD_CLOSED") {
            return res.status(400).json({
                code: "CARD_CLOSED",
                message: "Card is closed",
            });
        }

        if (error instanceof Error && error.message === "CARD_NOT_ACTIVE") {
            return res.status(400).json({
                code: "CARD_NOT_ACTIVE",
                message: "Card is not active",
            });
        }

        if (error instanceof Error && error.message === "CARD_FROZEN") {
            return res.status(400).json({
                code: "CARD_FROZEN",
                message: "Card is frozen",
            });
        }

        if (error instanceof Error && error.message === "INSUFFICIENT_FUNDS") {
            return res.status(400).json({
                code: "INSUFFICIENT_FUNDS",
                message: "Insufficient funds on the linked card",
            });
        }

        return res.status(500).json({
            message: "Server error",
        });
    }
};