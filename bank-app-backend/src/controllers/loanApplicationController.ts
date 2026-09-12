import { Response } from "express";

import LoanApplication from "../models/LoanApplication";
import CustomerFinancialProfile from "../models/CustomerFinancialProfile";
import Loan from "../models/Loan";

import { AuthRequest } from "../middleware/authMiddleware";

import {
    getCreditRating,
} from "../services/creditRatingService";

import {
    calculateBaseCreditScore,
    calculateCreditScore,
} from "../services/creditScoringService";
import { calculateCreditInterestRate } from "../services/creditInterestRateService";
import { calculateCreditPayments } from "../services/creditCalculatorService";

export const createLoanApplication = async (
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

        const {
            amount,
            termMonths,
            purpose,
        } = req.body;

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                code: "INVALID_AMOUNT",
                message: "Loan amount must be greater than zero",
            });
        }

        if (
            typeof termMonths !== "number" ||
            !Number.isInteger(termMonths) ||
            termMonths <= 0
        ) {
            return res.status(400).json({
                code: "INVALID_TERM",
                message: "Loan term must be a positive integer",
            });
        }

        const validPurposes = [
            "CAR",
            "EDUCATION",
            "MEDICAL",
            "HOME_RENOVATION",
            "TRAVEL",
            "OTHER",
        ];

        if (!validPurposes.includes(purpose)) {
            return res.status(400).json({
                code: "INVALID_PURPOSE",
                message: "Invalid loan purpose",
            });
        }

        const financialProfile = await CustomerFinancialProfile.findOne({userId});

        if (!financialProfile) {
            return res.status(400).json({
                code: "FINANCIAL_PROFILE_NOT_FOUND",
                message: "Customer financial profile is required",
            });
        }

        const activeLoans =
            await Loan.find({
                userId,
                status: "ACTIVE",
            });

        const monthlyInternalDebtPayments =
            activeLoans.reduce(
                (total, loan) =>
                    total + loan.monthlyPayment, 0
            );

        const monthlyExistingDebtPayments = monthlyInternalDebtPayments + financialProfile.monthlyExternalDebtPayments;

        const baseScore =
            calculateBaseCreditScore({
                dateOfBirth: financialProfile.dateOfBirth,
                monthlyIncome: financialProfile.monthlyIncome,
                employmentType: financialProfile.employmentType,
                employmentStartDate: financialProfile.employmentStartDate,
                amount,
                termMonths,
                purpose,
            });

        const interestRate =
            calculateCreditInterestRate({
                creditScore: baseScore,
            });

        const calculation =
            calculateCreditPayments({
                amount,
                termMonths,
                annualInterestRate: interestRate,
            });

        const creditRating = await getCreditRating(userId);

        if (!creditRating) {
            return res.status(500).json({
                message: "Credit rating not found",
            });
        }

        const scoringResult =
            calculateCreditScore({
                dateOfBirth: financialProfile.dateOfBirth,
                monthlyIncome: financialProfile.monthlyIncome,
                monthlyExistingDebtPayments,
                employmentType: financialProfile.employmentType,
                employmentStartDate: financialProfile.employmentStartDate,
                amount,
                termMonths,
                purpose,
                monthlyPayment: calculation.monthlyPayment,
                creditRating: creditRating.score,
            });

        const status =
            scoringResult.decision === "AUTO_APPROVED" ? "APPROVED" : 
            scoringResult.decision === "AUTO_REJECTED" ? "REJECTED" : "PENDING";

        const loanApplication =
            await LoanApplication.create({
                userId,
                amount,
                termMonths,
                purpose,
                creditScore: scoringResult.score,
                decision: scoringResult.decision,
                decisionReason: scoringResult.decisionReason,
                status,
            });

        if (scoringResult.decision === "AUTO_APPROVED") {
            await Loan.create({
                userId,
                applicationId: loanApplication._id,
                amount,
                termMonths,
                interestRate,
                monthlyPayment: calculation.monthlyPayment,
                totalPayment: calculation.totalPayment,
                totalInterest: calculation.totalInterest,
                remainingAmount: calculation.totalPayment,
                remainingPrincipal: amount,
                status: "ACTIVE",
            });
        }

        return res.status(201).json({
            id: loanApplication._id,
            amount: loanApplication.amount,
            termMonths: loanApplication.termMonths,
            purpose: loanApplication.purpose,
            creditScore: loanApplication.creditScore,
            decision: loanApplication.decision,
            decisionReason: loanApplication.decisionReason,
            status: loanApplication.status,
            interestRate,
            monthlyPayment: calculation.monthlyPayment,
            totalPayment: calculation.totalPayment,
            totalInterest: calculation.totalInterest,
            dti: scoringResult.dti,
            createdAt: loanApplication.createdAt,
        });
    } catch (error) {
        console.error(
            "Create loan application error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};