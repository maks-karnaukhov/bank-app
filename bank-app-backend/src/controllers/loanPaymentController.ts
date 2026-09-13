import { Response } from "express";

import Loan from "../models/Loan";
import LoanPayment from "../models/LoanPayment";

import { AuthRequest } from "../middleware/authMiddleware";
import { applyCreditRatingEvent } from "../services/creditRatingService";
import { markOverdueLoanPayments } from "../services/loanPaymentScheduleService";
import { processLoanPayment } from "../services/loanPaymentProcessingService";

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

        await markOverdueLoanPayments(userId);

        const result = await processLoanPayment({
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

        return res.status(201).json({
            id: result.payment._id,
            loanId: result.payment.loanId,
            amount: result.payment.amount,
            principalAmount: result.payment.principalAmount,
            interestAmount: result.payment.interestAmount,
            remainingAmount: result.payment.remainingAmount,
            status: result.payment.status,
            paidAt: result.payment.paidAt,

            schedule: {
                id: result.scheduleItem._id,
                installmentNumber: result.scheduleItem.installmentNumber,
                dueDate: result.scheduleItem.dueDate,
                status: result.scheduleItem.status,
                paymentStatus: result.wasLate ? "LATE" : "ON_TIME",
            },
        });
    } catch (error) {
        console.error(
            "Create loan payment error:",
            error
        );

        if (error instanceof Error &&  error.message === "LOAN_NOT_FOUND") {
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

        if (error instanceof Error && error.message === "PAYMENT_SCHEDULE_NOT_FOUND") {
            return res.status(400).json({
                code: "PAYMENT_SCHEDULE_NOT_FOUND",
                message: "No pending payment found in the loan schedule",
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
                amount: payment.amount,
                principalAmount: payment.principalAmount,
                interestAmount: payment.interestAmount,
                remainingAmount: payment.remainingAmount,
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