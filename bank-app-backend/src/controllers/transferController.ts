
import mongoose from "mongoose";
import { Response } from "express";

import Card from "../models/Card";
import User from "../models/User";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";
import { decrypt } from "../utils/crypto";

type RecipientMethod = "email" | "phone" | "card";
type TransferType = "own" | "recipient";

class TransferError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = "TransferError";
        this.statusCode = statusCode;
    }
}

const normalizeEmail = (value: string) =>
    value.trim().toLowerCase();

const normalizePhone = (value: string) =>
    value.replace(/\D/g, "");

const normalizeCardNumber = (value: string) =>
    value.replace(/\D/g, "");

const parseRecipientMethod = (
    value: unknown,
): RecipientMethod | null => {
    if (value === "email" ||  value === "phone" || value === "card") {
        return value;
    }

    return null;
};

const getSenderCard = async (
    fromCardId: string,
    userId: string,
    session: mongoose.ClientSession | null,
) => {
    if (!mongoose.isValidObjectId(fromCardId)) {
        throw new TransferError("Invalid sender card");
    }

    const card = await Card.findOne({
        _id: fromCardId,
        userId,
        type: "DEBIT",
        isActive: true,
        isFrozen: false,
        isClosed: false,
    }).session(session);

    if (!card) {
        throw new TransferError("Sender card is unavailable. Choose an active debit card.");
    }

    return card;
};

const findRecipient = async (
    method: RecipientMethod,
    value: string,
    session: mongoose.ClientSession | null,
) => {
    const normalizedValue = value.trim();

    if (method === "email") {
        return {
            recipient: await User.findOne({
                email: normalizeEmail(normalizedValue),
                isEmailVerified: true,
            }).session(session),
            matchedCardId: null as string | null,
        };
    }

    if (method === "phone") {
        const phone = normalizePhone(normalizedValue);

        const users = await User.find({
            isEmailVerified: true,
        })
            .select("_id email firstName lastName phone")
            .session(session);

        const recipient = users.find(
            (user) =>
                typeof user.phone === "string" &&
                normalizePhone(user.phone) === phone,
        );

        return {
            recipient: recipient ?? null,
            matchedCardId: null as string | null,
        };
    }

    const cardNumber = normalizeCardNumber(normalizedValue);

    if (!/^\d{16}$/.test(cardNumber)) {
        throw new TransferError(
            "Enter a valid 16-digit card number",
        );
    }

    const cards = await Card.find({
        type: "DEBIT",
        isActive: true,
        isFrozen: false,
        isClosed: false,
    })
        .select("_id userId encryptedNumber")
        .session(session);

    for (const card of cards) {
        let decryptedNumber: string;

        try {
            decryptedNumber = normalizeCardNumber(
                decrypt(card.encryptedNumber),
            );
        } catch (error) {
            console.error(
                `Unable to decrypt card ${card._id.toString()}`,
                error,
            );
            continue;
        }

        if (decryptedNumber !== cardNumber) {
            continue;
        }

        const recipient = await User.findOne({
            _id: card.userId,
            isEmailVerified: true,
        }).session(session);

        if (!recipient) {
            return {
                recipient: null,
                matchedCardId: null as string | null,
            };
        }

        return {
            recipient,
            matchedCardId: card._id.toString(),
        };
    }

    return {
        recipient: null,
        matchedCardId: null as string | null,
    };
};

const getAvailableRecipientCards = async (
    recipientId: mongoose.Types.ObjectId,
    currency: string,
    session: mongoose.ClientSession | null,
) => {
    const cards = await Card.find({
        userId: recipientId,
        type: "DEBIT",
        currency,
        isActive: true,
        isFrozen: false,
        isClosed: false,
    })
        .sort({ createdAt: 1 })
        .select("_id name type currency last4 color network isVirtual createdAt")
        .session(session);

    return cards.map((card) => ({
        id: card._id.toString(),
        name: card.name,
        type: card.type,
        currency: card.currency,
        last4: card.last4,
        color: card.color,
        network: card.network,
        isVirtual: card.isVirtual,
        createdAt: card.createdAt,
    }));
};

export const lookupTransferRecipient = async (
    req: AuthRequest,
    res: Response,
) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const method = parseRecipientMethod(req.query.method);
    const value =
        typeof req.query.value === "string"
            ? req.query.value.trim()
            : "";
    const fromCardId =
        typeof req.query.fromCardId === "string"
            ? req.query.fromCardId
            : "";

    if (!method) {
        return res.status(400).json({
            message: "Choose a recipient search method",
        });
    }

    if (!value) {
        return res.status(400).json({
            message: "Recipient details are required",
        });
    }

    if (
        method === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
        return res.status(400).json({
            message: "Enter a valid email address",
        });
    }

    if (
        method === "phone" &&
        normalizePhone(value).length < 7
    ) {
        return res.status(400).json({
            message: "Enter a valid phone number",
        });
    }

    try {
        const senderCard = await getSenderCard(
            fromCardId,
            userId,
            null,
        );

        const { recipient, matchedCardId } =
            await findRecipient(method, value, null);

        if (!recipient) {
            return res.status(200).json({
                found: false,
                recipient: null,
                cards: [],
                matchedCardId: null,
                message: "No verified account was found",
            });
        }

        if (recipient._id.toString() === userId) {
            return res.status(200).json({
                found: false,
                recipient: null,
                cards: [],
                matchedCardId: null,
                message: "This is your own account. Choose the own-card transfer mode.",
            });
        }

        const cards = await getAvailableRecipientCards(
            recipient._id,
            senderCard.currency,
            null,
        );

        return res.status(200).json({
            found: true,
            recipient: {
                id: recipient._id.toString(),
                firstName: recipient.firstName,
                lastName: recipient.lastName,
                email: recipient.email,
            },
            cards,
            matchedCardId,
            message: cards.length === 0 ? "This user has no available debit cards in the sender's currency" : null,
        });
    } catch (error) {
        if (error instanceof TransferError) {
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Recipient lookup error:", error);

        return res.status(500).json({
            message: "Failed to search for recipient",
        });
    }
};

export const createTransfer = async (
    req: AuthRequest,
    res: Response,
) => {
    const userId = req.userId;

    const {
        fromCardId,
        amount,
        transferType: requestedTransferType,
        recipientMethod: requestedMethod,
        recipientValue: requestedValue,
        to,
        toCardId,
        anyCard: requestedAnyCard,
    } = req.body;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    if (
        typeof fromCardId !== "string" ||
        !mongoose.isValidObjectId(fromCardId)
    ) {
        return res.status(400).json({
            message: "Invalid sender card",
        });
    }

    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        Math.round(amount * 100) !== amount * 100
    ) {
        return res.status(400).json({
            message: "Amount must be positive and have at most 2 decimal places",
        });
    }

    const transferType: TransferType = requestedTransferType === "own" ? "own" : "recipient";

    if (
        requestedTransferType !== undefined &&
        requestedTransferType !== "own" &&
        requestedTransferType !== "recipient"
    ) {
        return res.status(400).json({
            message: "Invalid transfer type",
        });
    }

    if (
        toCardId !== undefined &&
        (
            typeof toCardId !== "string" ||
            !mongoose.isValidObjectId(toCardId)
        )
    ) {
        return res.status(400).json({
            message: "Invalid recipient card",
        });
    }

    const anyCard = typeof requestedAnyCard === "boolean" ? requestedAnyCard : !toCardId;

    if (transferType === "own") {
        if (!toCardId || anyCard) {
            return res.status(400).json({
                message: "Choose a destination card belonging to your account",
            });
        }
    } else {
        if (Boolean(toCardId) === anyCard) {
            return res.status(400).json({
                message: "Choose a recipient card or enable automatic card selection",
            });
        }
    }

    const method =
        parseRecipientMethod(requestedMethod) ??
        (typeof to === "string" ? "email" : null);

    const value =
        typeof requestedValue === "string"
            ? requestedValue.trim()
            : typeof to === "string"
                ? to.trim()
                : "";

    if (transferType === "recipient" && (!method || !value)) {
        return res.status(400).json({
            message: "Recipient details are required",
        });
    }

    const session = await mongoose.startSession();

    try {
        let createdTransaction: {
            id: string;
            from: string;
            to: string;
            amount: number;
            currency: string;
            date: string;
            direction: "outgoing";
        } | null = null;

        await session.withTransaction(async () => {
            const sender = await User.findById(userId).session(session);

            if (!sender) {
                throw new TransferError("Sender not found", 404);
            }

            const senderCard = await getSenderCard(
                fromCardId,
                userId,
                session,
            );

            let recipient = sender;
            let recipientOwnerId = sender._id;

            if (transferType === "recipient") {
                const result = await findRecipient(
                    method as RecipientMethod,
                    value,
                    session,
                );

                if (!result.recipient) {
                    throw new TransferError(
                        "Verified recipient account not found",
                        404,
                    );
                }

                if (result.recipient._id.toString() === userId) {
                    throw new TransferError("Use own-card transfer mode to transfer between your cards");
                }

                recipient = result.recipient;
                recipientOwnerId = recipient._id;
            }

            if (toCardId === fromCardId) {
                throw new TransferError("Source and destination cards must be different");
            }

            let recipientCard;

            if (toCardId) {
                recipientCard = await Card.findOne({
                    _id: toCardId,
                    userId: recipientOwnerId,
                    type: "DEBIT",
                    currency: senderCard.currency,
                    isActive: true,
                    isFrozen: false,
                    isClosed: false,
                }).session(session);

                if (!recipientCard) {
                    throw new TransferError(
                        transferType === "own" ? "Destination card is not available in your account" : "Selected recipient card is unavailable",
                    );
                }
            } else {
                if (transferType === "own") {
                    throw new TransferError("Choose a destination card for your own-card transfer");
                }

                recipientCard = await Card.findOne({
                    userId: recipientOwnerId,
                    type: "DEBIT",
                    currency: senderCard.currency,
                    isActive: true,
                    isFrozen: false,
                    isClosed: false,
                })
                    .sort({ createdAt: 1 })
                    .session(session);

                if (!recipientCard) {
                    throw new TransferError("Recipient has no available debit card in the same currency");
                }
            }

            const debitedCard = await Card.findOneAndUpdate(
                {
                    _id: senderCard._id,
                    userId,
                    type: "DEBIT",
                    isActive: true,
                    isFrozen: false,
                    isClosed: false,
                    currency: senderCard.currency,
                    balance: { $gte: amount },
                },
                {
                    $inc: { balance: -amount },
                },
                {
                    new: true,
                    session,
                },
            );

            if (!debitedCard) {
                throw new TransferError(
                    "Insufficient funds or sender card is unavailable",
                );
            }

            const creditedCard = await Card.findOneAndUpdate(
                {
                    _id: recipientCard._id,
                    userId: recipientOwnerId,
                    type: "DEBIT",
                    isActive: true,
                    isFrozen: false,
                    isClosed: false,
                    currency: senderCard.currency,
                },
                {
                    $inc: { balance: amount },
                },
                {
                    new: true,
                    session,
                },
            );

            if (!creditedCard) {
                throw new TransferError(
                    "Recipient card is unavailable",
                );
            }

            const [transaction] = await Transaction.create(
                [
                    {
                        from: sender._id,
                        to: recipient._id,
                        fromCard: debitedCard._id,
                        toCard: creditedCard._id,
                        amount,
                        currency: senderCard.currency,
                        type: "transfer",
                    },
                ],
                { session },
            );

            if (!transaction) {
                throw new Error(
                    "Transfer transaction was not created",
                );
            }

            createdTransaction = {
                id: transaction._id.toString(),
                from: sender.email,
                to: recipient.email,
                amount,
                currency: senderCard.currency,
                date: transaction.createdAt.toISOString(),
                direction: "outgoing",
            };
        });

        if (!createdTransaction) {
            throw new Error("Transfer transaction was not created");
        }

        return res.status(201).json({
            success: true,
            transaction: createdTransaction,
        });
    } catch (error) {
        if (error instanceof TransferError) {
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Create transfer error:", error);

        return res.status(500).json({
            message: "Failed to complete transfer",
        });
    } finally {
        await session.endSession();
    }
};