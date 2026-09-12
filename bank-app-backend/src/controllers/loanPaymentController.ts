import { Response } from "express";

import Loan from "../models/Loan";
import LoanPayment from "../models/LoanPayment";

import { AuthRequest } from "../middleware/authMiddleware";

import { calculateLoanPayment } from "../services/loanPaymentService";
import { applyCreditRatingEvent } from "../services/creditRatingService";

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

        if (loan.status !== "ACTIVE") {
            return res.status(400).json({
                code: "LOAN_NOT_ACTIVE",
                message: "Loan is not active",
            });
        }

        if (
            loan.remainingPrincipal <= 0
        ) {
            return res.status(400).json({
                code: "LOAN_ALREADY_PAID",
                message: "Loan is already paid",
            });
        }

        const calculation =
            calculateLoanPayment({
                remainingPrincipal: loan.remainingPrincipal,
                monthlyPayment: loan.monthlyPayment,
                annualInterestRate: loan.interestRate,
            });

        const payment =
            await LoanPayment.create({
                userId,
                loanId: loan._id,
                amount: calculation.paymentAmount,
                principalAmount: calculation.principalAmount,
                interestAmount: calculation.interestAmount,
                remainingAmount: calculation.remainingPrincipal,
                status: "COMPLETED",
                paidAt: new Date(),
            });

        loan.remainingPrincipal = calculation.remainingPrincipal;
        loan.remainingAmount = Math.max(0, loan.remainingAmount - calculation.paymentAmount);

        const loanPaid = loan.remainingPrincipal <= 0;

        if (loanPaid) {
            loan.remainingPrincipal = 0;
            loan.remainingAmount = 0;
            loan.status = "PAID";
        }

        await loan.save();

        await applyCreditRatingEvent({
            userId,
            loanId: loan._id.toString(),
            type: "PAYMENT_ON_TIME",
        });

        if (loanPaid) {
            await applyCreditRatingEvent({
                userId,
                loanId: loan._id.toString(),
                type: "LOAN_PAID",
            });
        }

        return res.status(201).json({
            id: payment._id,
            loanId: payment.loanId,
            amount: payment.amount,
            principalAmount: payment.principalAmount,
            interestAmount: payment.interestAmount,
            remainingAmount: payment.remainingAmount,
            status: payment.status,
            paidAt: payment.paidAt,
        });
    } catch (error) {
        console.error(
            "Create loan payment error:",
            error
        );

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