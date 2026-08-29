import { Response } from "express";

import Loan from "../models/Loan";

import { AuthRequest } from "../middleware/authMiddleware";

export const getLoans = async (
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

        const loans = await Loan.find({
            userId,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json(
            loans.map((loan) => ({
                id: loan._id,
                amount: loan.amount,
                termMonths: loan.termMonths,
                interestRate: loan.interestRate,
                monthlyPayment: loan.monthlyPayment,
                totalPayment: loan.totalPayment,
                totalInterest: loan.totalInterest,
                remainingAmount: loan.remainingAmount,
                remainingPrincipal: loan.remainingPrincipal,
                status: loan.status,
                createdAt: loan.createdAt,
            }))
        );
    } catch (error) {
        console.error(
            "Get loans error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const getLoanById = async (
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

        return res.status(200).json({
            id: loan._id,
            amount: loan.amount,
            termMonths: loan.termMonths,
            interestRate: loan.interestRate,
            monthlyPayment: loan.monthlyPayment,
            totalPayment: loan.totalPayment,
            totalInterest: loan.totalInterest,
            remainingAmount: loan.remainingAmount,
            remainingPrincipal: loan.remainingPrincipal,
            status: loan.status,
            createdAt: loan.createdAt,
        });
    } catch (error) {
        console.error(
            "Get loan by id error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};