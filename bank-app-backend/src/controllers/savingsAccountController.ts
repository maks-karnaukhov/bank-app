import { Response } from "express";

import SavingsAccount from "../models/SavingsAccount";
import { AuthRequest } from "../middleware/authMiddleware";

const SAVINGS_INTEREST_RATE = 7.5;

export const createSavingsAccount = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const {
            name,
            purpose,
            goalAmount,
        } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                code: "INVALID_NAME",
                message: "Savings account name is required",
            });
        }

        if (!purpose?.trim()) {
            return res.status(400).json({
                code: "INVALID_PURPOSE",
                message: "Savings account purpose is required",
            });
        }

        if (
            goalAmount === undefined ||
            goalAmount === null ||
            typeof goalAmount !== "number" ||
            !Number.isFinite(goalAmount) ||
            goalAmount <= 0
        ) {
            return res.status(400).json({
                code: "INVALID_GOAL_AMOUNT",
                message: "Goal amount must be greater than zero",
            });
        }

        const savingsAccount =
            await SavingsAccount.create({
                userId,
                name: name.trim(),
                purpose: purpose.trim(),
                goalAmount,
                balance: 0,
                currency: "USD",
                interestRate: SAVINGS_INTEREST_RATE,
                lastInterestAppliedAt: new Date(),
                isClosed: false,
            });

        return res.status(201).json({
            id: savingsAccount._id,
            name: savingsAccount.name,
            purpose: savingsAccount.purpose,
            goalAmount: savingsAccount.goalAmount,
            balance: savingsAccount.balance,
            currency: savingsAccount.currency,
            interestRate: savingsAccount.interestRate,
            lastInterestAppliedAt: savingsAccount.lastInterestAppliedAt,
            isClosed: savingsAccount.isClosed,
            createdAt: savingsAccount.createdAt,
        });
    } catch (error) {
        console.error(
            "Create savings account error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const getSavingsAccounts = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const savingsAccounts =
            await SavingsAccount.find({
                userId,
                isClosed: false,
            }).sort({
                createdAt: -1,
            });

        return res.status(200).json(
            savingsAccounts.map(
                (account) => ({
                    id: account._id,
                    name: account.name,
                    purpose: account.purpose,
                    goalAmount: account.goalAmount,
                    balance: account.balance,
                    currency: account.currency,
                    interestRate: account.interestRate,
                    lastInterestAppliedAt: account.lastInterestAppliedAt,
                    isClosed: account.isClosed,
                    createdAt: account.createdAt,
                })
            )
        );
    } catch (error) {
        console.error(
            "Get savings accounts error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const closeSavingsAccount = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const account = await SavingsAccount.findOne({
            _id: id,
            userId,
        });

        if (!account) {
            return res.status(404).json({
                code: "SAVINGS_ACCOUNT_NOT_FOUND",
                message: "Savings account not found",
            });
        }

        if (account.isClosed) {
            return res.status(400).json({
                code: "SAVINGS_ACCOUNT_ALREADY_CLOSED",
                message: "Savings account is already closed",
            });
        }

        if (account.balance !== 0) {
            return res.status(400).json({
                code: "SAVINGS_ACCOUNT_HAS_BALANCE",
                message: "Savings account cannot be closed while it has a balance",
            });
        }

        account.isClosed = true;

        await account.save();

        return res.status(200).json({
            message: "Savings account closed successfully",
            account: {
                id: account._id,
                isClosed: account.isClosed,
            },
        });
    } catch (error) {
        console.error(
            "Close savings account error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};