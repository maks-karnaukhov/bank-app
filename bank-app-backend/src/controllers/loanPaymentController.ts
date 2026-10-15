import { Response } from "express";

import Loan from "../models/Loan";
import LoanPayment from "../models/LoanPayment";

import { AuthRequest } from "../middleware/authMiddleware";
import { applyCreditRatingEvent } from "../services/creditRatingService";
import { markOverdueLoanPayments } from "../services/loanPaymentScheduleService";
import {
    makeScheduledLoanPayment,
    makeEarlyLoanRepayment,
} from "../services/loanPaymentService";

export const createLoanPayment = async (
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

        const { cardId } = req.body;

        if (
            typeof cardId !== "string" ||
            !cardId
        ) {
            return res.status(400).json({
                code: "CARD_ID_REQUIRED",
                message: "Card ID is required",
            });
        }

        await markOverdueLoanPayments(
            userId
        );

        const result =
            await makeScheduledLoanPayment({
                userId,
                loanId: id,
                cardId,
            });

        if (!result) {
            return res.status(500).json({
                message:
                    "Failed to create loan payment",
            });
        }

        if (result.loan.status === "PAID") {
            await applyCreditRatingEvent({
                userId,
                loanId: id,
                type: "LOAN_PAID",
            });
        } else {
            await applyCreditRatingEvent({
                userId,
                loanId: id,
                type: "PAYMENT_ON_TIME",
            });
        }

        return res.status(201).json({
            id: result.transaction._id,
            loanId: result.transaction.loanId,
            amount: result.transaction.amount,
            principalAmount: result.transaction.principalAmount,
            interestAmount: result.transaction.interestAmount,
            remainingAmount: result.transaction.remainingAmount,
            status: result.transaction.status,
            paidAt: result.transaction.paidAt,
            schedule: {
                id: result.payment._id,
                installmentNumber: result.payment.installmentNumber,
                dueDate: result.payment.dueDate,
                status: result.payment.status,
                paidAt: result.payment.paidAt,
            },

            loan: result.loan,
        });
    } catch (error) {
        console.error(
            "Create loan payment error:",
            error
        );

        if (
            error instanceof Error &&
            error.message === "LOAN_NOT_FOUND"
        ) {
            return res.status(404).json({
                code: "LOAN_NOT_FOUND",
                message: "Loan not found",
            });
        }

        if (
            error instanceof Error &&
            error.message === "LOAN_NOT_ACTIVE"
        ) {
            return res.status(400).json({
                code: "LOAN_NOT_ACTIVE",
                message: "Loan is not active",
            });
        }

        if (
            error instanceof Error &&
            error.message === "NO_PENDING_PAYMENT"
        ) {
            return res.status(400).json({
                code: "NO_PENDING_PAYMENT",
                message: "No pending payment found in the loan schedule",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
                "CARD_NOT_FOUND"
        ) {
            return res.status(404).json({
                code: "CARD_NOT_FOUND",
                message: "Active card not found",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
                "INSUFFICIENT_FUNDS"
        ) {
            return res.status(400).json({
                code: "INSUFFICIENT_FUNDS",
                message: "Insufficient funds",
            });
        }

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const getLoanPayments = async (
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

        const loan = await Loan.findOne({
            _id: id,
            userId,
        });

        if (!loan) {
            return res.status(404).json({
                code: "LOAN_NOT_FOUND",
                message: "Loan not found",
            });
        }

        const payments =
            await LoanPayment.find({
                loanId: loan._id,
                userId,
            }).sort({
                paidAt: -1,
            });

        return res.status(200).json(
            payments.map((payment) => ({
                id: payment._id,
                loanId: payment.loanId,
                cardId: payment.cardId,
                amount: payment.amount,
                principalAmount: payment.principalAmount,
                interestAmount: payment.interestAmount,
                remainingAmount: payment.remainingAmount,
                type: payment.type,
                status: payment.status,
                paidAt: payment.paidAt,
            }))
        );
    } catch (error) {
        console.error(
            "Get loan payments error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const createEarlyLoanRepayment = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        const { cardId } = req.body;
        const id = req.params.id;

        if (typeof id !== "string" || !id) {
            return res.status(400).json({
                code: "LOAN_ID_REQUIRED",
                message: "Loan ID is required",
            });
        }

        if (!id) {
            return res.status(400).json({
                code: "LOAN_ID_REQUIRED",
                message: "Loan ID is required",
            });
        }

        if (typeof cardId !== "string" || !cardId) {
            return res.status(400).json({
                code: "CARD_ID_REQUIRED",
                message: "Card ID is required",
            });
        }

        const result = await makeEarlyLoanRepayment({
            userId,
            loanId: id,
            cardId,
        });

        await applyCreditRatingEvent({
            userId,
            loanId: id,
            type: "LOAN_PAID",
        });

        return res.status(201).json({
            id: result.transaction._id,
            loanId: result.transaction.loanId,
            cardId: result.transaction.cardId,
            amount: result.transaction.amount,
            principalAmount: result.transaction.principalAmount,
            interestAmount: result.transaction.interestAmount,
            remainingAmount: result.transaction.remainingAmount,
            type: result.transaction.type,
            status: result.transaction.status,
            paidAt: result.transaction.paidAt,
            loan: result.loan,
        });
    } catch (error) {
        console.error("Early loan repayment error:", error);

        if (error instanceof Error) {
            const errors: Record<
                string,
                { status: number; message: string }
            > = {
                LOAN_NOT_FOUND: {
                    status: 404,
                    message: "Loan not found",
                },
                LOAN_NOT_ACTIVE: {
                    status: 400,
                    message: "Loan is not active",
                },
                LOAN_ALREADY_PAID: {
                    status: 400,
                    message: "Loan has no outstanding principal",
                },
                CARD_NOT_FOUND: {
                    status: 404,
                    message: "Active card not found",
                },
                INSUFFICIENT_FUNDS: {
                    status: 400,
                    message: "Insufficient funds",
                },
            };

            const knownError = errors[error.message];

            if (knownError) {
                return res.status(knownError.status).json({
                    code: error.message,
                    message: knownError.message,
                });
            }
        }

        return res.status(500).json({
            code: "SERVER_ERROR",
            message: "Server error",
        });
    }
};