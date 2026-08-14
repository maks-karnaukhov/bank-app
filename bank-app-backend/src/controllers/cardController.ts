import bcrypt from "bcrypt";
import { Response } from "express";

import Card from "../models/Card";
import User from "../models/User";
import CardRevealAttempt from "../models/CardRevealAttempt";

import {
encrypt,
decrypt,
} from "../utils/crypto";

import {
generateCardNumber,
generateExpiryDate,
generateCvv,
} from "../utils/cardGenerator";

import { AuthRequest } from "../middleware/authMiddleware";
import CardOrder from "../models/CardOrder";

export const getCards = async (
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

        const cards = await Card.find({
            userId,
        }).sort({
            createdAt: -1,
        });

        const safeCards = cards.map(
            (card) => ({
                id: card._id,
                name: card.name,
                type: card.type,
                currency: card.currency,
                last4: card.last4,
                balance: card.balance,
                creditLimit: card.creditLimit,
                color: card.color,
                isActive: card.isActive,
                createdAt: card.createdAt,
                network: card.network,
                isVirtual: card.isVirtual,
            })
        );

        return res.status(200).json(
            safeCards
        );
    } catch (error) {
        console.error(
            "Get cards error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }

};

export const getCardDetails = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { cardId } = req.params;
        const { password } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!cardId) {
            return res.status(400).json({
                message:
                    "Card ID is required",
            });
        }

        if (!password) {
            return res.status(400).json({
                message:
                    "Password is required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        const isPasswordValid = await bcrypt.compare(
                password,
                user.passwordHash
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                message:
                    "Invalid password",
            });
        }

        const card = await Card.findOne({
                _id: cardId,
                userId,
            });

        if (!card) {
            return res.status(404).json({
                message:
                    "Card not found",
            });
        }

        const number = decrypt(card.encryptedNumber);
        const expiryDate = decrypt(card.encryptedExpiryDate);
        const cvv = decrypt(card.encryptedCvv);

        return res.status(200).json({
            number,
            expiryDate,
            cvv,
            holderName: card.holderName,
        });
    } catch (error) {
        console.error(
            "Get card details error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }

};

export const createVirtualCard = async (
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

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        const existingCard = await Card.findOne({
                userId,
                type: "DEBIT",
                isActive: true,
            });

        if (existingCard) {
            return res.status(400).json({
                message:
                    "Active debit card already exists",
            });
        }

        const cardNumber = generateCardNumber();
        const expiryDate = generateExpiryDate();
        const cvv = generateCvv();

        const card = await Card.create({
                userId,
                type: "DEBIT",
                currency: "USD",
                isActive: true,
                name: "Main card",
                color: "#2563eb",
                encryptedNumber: encrypt(cardNumber),
                last4: cardNumber.slice(-4),
                holderName: `${user.firstName} ${user.lastName}`,
                encryptedExpiryDate: encrypt(expiryDate),
                encryptedCvv: encrypt(cvv),
                balance: 0,
                creditLimit: null,
                network: "VISA",
                isVirtual: true,
            });

        return res.status(201).json({
            id: card._id,
            name: card.name,
            type: card.type,
            currency: card.currency,
            last4: card.last4,
            balance: card.balance,
            creditLimit: card.creditLimit,
            color: card.color,
            isActive: card.isActive,
            createdAt: card.createdAt,
            network: card.network,
            isVirtual: card.isVirtual,
        });
    } catch (error) {
        console.error(
            "Create virtual card error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }

};

export const createInitialCard = async (
    userId: string
) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    const existingCard = await Card.findOne({
            userId,
        });

    if (existingCard) {
        return existingCard;
    }

    const cardNumber = generateCardNumber();
    const expiryDate = generateExpiryDate();
    const cvv = generateCvv();

    const card =
        await Card.create({
            userId,
            type: "DEBIT",
            currency: "USD",
            name: "Main card",
            color: "#2563eb",
            encryptedNumber: encrypt(cardNumber),
            last4: cardNumber.slice(-4),
            holderName: `${user.firstName} ${user.lastName}`,
            encryptedExpiryDate: encrypt(expiryDate),
            encryptedCvv: encrypt(cvv),
            balance: 0,
            creditLimit: null,
            network: "VISA",
            isActive: true,
            isVirtual: true,
        });

    console.log(
        `Initial virtual card created for user ${userId}`
    );

    return card;

};

export const getCardById = async (
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

        const card = await Card.findOne({
                _id: id,
                userId,
            });

        if (!card) {
            return res.status(404).json({
                message:
                    "Card not found",
            });
        }

        return res.status(200).json({
            id: card._id,
            name: card.name,
            type: card.type,
            currency: card.currency,
            last4: card.last4,
            balance: card.balance,
            creditLimit: card.creditLimit,
            color: card.color,
            isActive: card.isActive,
            createdAt: card.createdAt,
            network: card.network,
            isVirtual: card.isVirtual,
        });
    } catch (error) {
        console.error(
            "Get card error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }

};

export const revealCardDetails = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { password } = req.body;

        const MAX_ATTEMPTS = 5;
        const BLOCK_DURATION_MS =
            15 * 60 * 1000;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!password) {
            return res.status(400).json({
                message:
                    "Password is required",
            });
        }

        const card = await Card.findOne({
                _id: id,
                userId,
            });

        if (!card) {
            return res.status(404).json({
                message:
                    "Card not found",
            });
        }

        let attempt = await CardRevealAttempt.findOne({
                userId,
                cardId: card._id,
            });

        if (!attempt) {
            attempt =
                await CardRevealAttempt.create({
                    userId,
                    cardId: card._id,
                    attemptsLeft:
                        MAX_ATTEMPTS,
                    blockedUntil:
                        null,
                });
        }

        if (
            attempt.blockedUntil &&
            attempt.blockedUntil >
                new Date()
        ) {
            return res.status(429).json({
                code: "CARD_REVEAL_BLOCKED",
                message: "Too many incorrect attempts. Try again later.",
                retryAt: attempt.blockedUntil,
                attemptsLeft: 0,
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        const isPasswordValid = await bcrypt.compare(
                password,
                user.passwordHash
            );

        if (!isPasswordValid) {
            attempt.attemptsLeft -= 1;

            if (
                attempt.attemptsLeft <= 0
            ) {
                const blockedUntil =
                    new Date(
                        Date.now() +
                            BLOCK_DURATION_MS
                    );

                attempt.attemptsLeft = 0;
                attempt.blockedUntil = blockedUntil;

                await attempt.save();

                return res.status(429).json({
                    code: "CARD_REVEAL_BLOCKED",
                    message: "Too many incorrect attempts. Try again later.",
                    retryAt: blockedUntil,
                    attemptsLeft: 0,
                });
            }

            await attempt.save();

            return res.status(401).json({
                code: "INVALID_PASSWORD",
                message: "Invalid password",
                attemptsLeft: attempt.attemptsLeft,
            });
        }

        attempt.attemptsLeft = MAX_ATTEMPTS;

        attempt.blockedUntil = null;

        await attempt.save();

        const cardNumber = decrypt(card.encryptedNumber);
        const expiryDate = decrypt(card.encryptedExpiryDate);
        const cvv = decrypt(card.encryptedCvv);

        return res.status(200).json({
            id: card._id,
            name: card.name,
            type: card.type,
            network: card.network,
            currency: card.currency,
            number: cardNumber,
            expiryDate,
            cvv,
            holderName: card.holderName,
            balance: card.balance,
            creditLimit: card.creditLimit,
            isVirtual: card.isVirtual,
        });
    } catch (error) {
        console.error(
            "Reveal card details error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }

};

export const getCardRevealStatus = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const MAX_ATTEMPTS = 5;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const card = await Card.findOne({
                _id: id,
                userId,
            });

        if (!card) {
            return res.status(404).json({
                message:
                    "Card not found",
            });
        }

        const attempt = await CardRevealAttempt.findOne({
                userId,
                cardId: card._id,
            });

        if (!attempt) {
            return res.status(200).json({
                attemptsLeft:
                    MAX_ATTEMPTS,
                blockedUntil: null,
            });
        }

        if (
            attempt.blockedUntil &&
            attempt.blockedUntil <= new Date()
        ) {
            attempt.blockedUntil =
                null;

            attempt.attemptsLeft =
                MAX_ATTEMPTS;

            await attempt.save();
        }

        return res.status(200).json({
            attemptsLeft:
                attempt.attemptsLeft,
            blockedUntil:
                attempt.blockedUntil,
        });
    } catch (error) {
        console.error(
            "Get card reveal status error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }

};

export const activateCard = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { password } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!password) {
            return res.status(400).json({
                message:
                    "Password is required",
            });
        }

        const card = await Card.findOne({
                _id: id,
                userId,
                isVirtual: false,
            });

        if (!card) {
            return res.status(404).json({
                message:
                    "Physical card not found",
            });
        }

        if (card.isActive) {
            return res.status(400).json({
                message:
                    "Card is already active",
            });
        }

        const user = await User.findById(
                userId
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        const isPasswordValid = await bcrypt.compare(
                password,
                user.passwordHash
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                message:
                    "Invalid password",
            });
        }

        const order = await CardOrder.findOne({
                userId,
                cardId: card._id,
            });

        if (!order) {
            return res.status(404).json({
                message:
                    "Card order not found",
            });
        }

        if (order.status !== "DELIVERED") {
            return res.status(400).json({
                message:
                    "Card cannot be activated in its current status",
            });
        }

        card.isActive = true;

        await card.save();

        order.status = "ACTIVATED";
        order.activatedAt = new Date();

        await order.save();

        return res.status(200).json({
            message: "Card activated successfully",
            card: {
                id: card._id,
                name: card.name,
                type: card.type,
                network: card.network,
                currency: card.currency,
                last4: card.last4,
                balance: card.balance,
                creditLimit: card.creditLimit,
                color: card.color,
                isActive: card.isActive,
                isVirtual: card.isVirtual,
                createdAt: card.createdAt,
            },
        });
    } catch (error) {
        console.error(
            "Activate card error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};