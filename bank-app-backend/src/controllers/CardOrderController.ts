import { Response } from "express";

import CardOrder from "../models/CardOrder";
import Card from "../models/Card";
import User from "../models/User";

import { AuthRequest } from "../middleware/authMiddleware";
import {
    generateCardNumber,
    generateCvv,
    generateExpiryDate,
} from "../utils/cardGenerator";
import { encrypt } from "../utils/crypto";

const MAX_PHYSICAL_CARDS = 5;

const isValidHexColor = (color: string) => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
};

export const createCardOrder = async (
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
            city,
            street,
            house,
            apartment,
            cardColor,
        } = req.body;

        if (
            !city ||
            !street ||
            !house ||
            !apartment
        ) {
            return res.status(400).json({
                message: "Delivery address is required",
            });
        }

        if (!cardColor) {
            return res.status(400).json({
                message: "Card color is required",
            });
        }

        if (!isValidHexColor(cardColor)) {
            return res.status(400).json({
                message: "Invalid card color",
            });
        }

        const physicalCardCount =
            await Card.countDocuments({
                userId,
                isVirtual: false,
                isClosed: false,
            });

        if (
            physicalCardCount >=
            MAX_PHYSICAL_CARDS
        ) {
            return res.status(400).json({
                code: "MAX_PHYSICAL_CARDS_REACHED",
                message:
                    "Maximum number of physical cards reached",
            });
        }

        const existingOrder =
            await CardOrder.findOne({
                userId,
                status: {
                    $in: [
                        "ORDERED",
                        "PROCESSING",
                        "DELIVERY_SCHEDULED",
                        "DELIVERED",
                    ],
                },
            });

        if (existingOrder) {
            return res.status(400).json({
                message:
                    "Physical card order already exists",
            });
        }

        const order = await CardOrder.create({
            userId,
            type: "PHYSICAL",
            status: "ORDERED",

            cardColor,

            deliveryAddress: {
                city,
                street,
                house,
                apartment,
            },
        });

        return res.status(201).json({
            id: order._id,
            type: order.type,
            status: order.status,
            deliveryAddress:
                order.deliveryAddress,
            cardColor: order.cardColor,
            specialistName:
                order.specialistName,
            scheduledAt:
                order.scheduledAt,
        });
    } catch (error) {
    console.error(
        "Create card order error:",
        error
    );

    return res.status(500).json({
        message: "Server error",
    });
}

};

export const getCurrentCardOrder = async (
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

        const order =
            await CardOrder.findOne({
                userId,
                status: {
                    $in: [
                        "ORDERED",
                        "PROCESSING",
                        "DELIVERY_SCHEDULED",
                        "DELIVERED",
                    ],
                },
            }).sort({
                createdAt: -1,
            });

        if (!order) {
            return res.status(200).json(null);
        }

        return res.status(200).json({
            id: order._id,
            type: order.type,
            status: order.status,
            deliveryAddress:
                order.deliveryAddress,
            cardColor: order.cardColor,
            specialistName:
                order.specialistName,
            scheduledAt:
                order.scheduledAt,
            deliveredAt:
                order.deliveredAt,
            cardId: order.cardId,
            activatedAt:
                order.activatedAt,
        });
    } catch (error) {
    console.error(
        "Get current card order error:",
        error
    );

    return res.status(500).json({
        message: "Server error",
    });
}

};

export const scheduleCardOrder = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const {
            specialistName,
            scheduledAt,
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!id) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }

        if (
            !specialistName ||
            !scheduledAt
        ) {
            return res.status(400).json({
                message:
                    "Specialist name and scheduled date are required",
            });
        }

        const date = new Date(
            scheduledAt
        );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid scheduled date",
            });
        }

        if (date <= new Date()) {
            return res.status(400).json({
                message:
                    "Scheduled date must be in the future",
            });
        }

        const order = await CardOrder.findOne({
                _id: id,
                userId,
        });

        if (!order) {
            return res.status(404).json({
                message:
                    "Card order not found",
            });
        }

        if (
            order.status !== "ORDERED" &&
            order.status !== "PROCESSING"
        ) {
            return res.status(400).json({
                message:
                    "Card order cannot be scheduled in its current status",
            });
        }

        order.specialistName = specialistName;
        order.scheduledAt = date;
        order.status = "DELIVERY_SCHEDULED";

        await order.save();

        return res.status(200).json({
            id: order._id,
            type: order.type,
            status: order.status,
            deliveryAddress: order.deliveryAddress,
            cardColor: order.cardColor,
            specialistName: order.specialistName,
            scheduledAt: order.scheduledAt,
            deliveredAt: order.deliveredAt,
        });
    } catch (error) {
        console.error(
            "Schedule card order error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const deliverCardOrder = async (
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

        if (!id) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }

        const order =
            await CardOrder.findOne({
                _id: id,
                userId,
            });

        if (!order) {
            return res.status(404).json({
                message:
                    "Card order not found",
            });
        }

        if (
            order.status !==
            "DELIVERY_SCHEDULED"
        ) {
            return res.status(400).json({
                message:
                    "Card order cannot be delivered in its current status",
            });
        }

        if (order.cardId) {
            return res.status(400).json({
                message:
                    "Card has already been issued",
            });
        }

        const physicalCardCount =
            await Card.countDocuments({
                userId,
                isVirtual: false,
                isClosed: false,
            });

        if (
            physicalCardCount >=
            MAX_PHYSICAL_CARDS
        ) {
            return res.status(400).json({
                code:
                    "MAX_PHYSICAL_CARDS_REACHED",
                message:
                    "Maximum number of physical cards reached",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const cardNumber = generateCardNumber();
        const expiryDate = generateExpiryDate();
        const cvv = generateCvv();

        const card =
            await Card.create({
                userId,
                type: "DEBIT",
                currency: "USD",
                isActive: false,
                isVirtual: false,
                name: "Physical card",
                color: order.cardColor || "#111827",
                encryptedNumber: encrypt(cardNumber),
                last4: cardNumber.slice(-4),
                holderName: `${user.firstName} ${user.lastName}`,
                encryptedExpiryDate: encrypt(expiryDate),
                encryptedCvv: encrypt(cvv),
                balance: 0,
                creditLimit: null,
                network: "VISA",
            });

        order.cardId = card._id;
        order.status = "DELIVERED";
        order.deliveredAt = new Date();

        await order.save();

        return res.status(200).json({
            id: order._id,
            type: order.type,
            status: order.status,
            deliveryAddress: order.deliveryAddress,
            cardColor: order.cardColor,
            specialistName: order.specialistName,
            scheduledAt: order.scheduledAt,
            deliveredAt: order.deliveredAt,
            cardId: order.cardId,
        });
    } catch (error) {
        console.error(
            "Deliver card order error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }

};

export const activateCardOrder = async (
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

        if (!id) {
            return res.status(400).json({
                message:
                    "Order ID is required",
            });
        }

        const order =
            await CardOrder.findOne({
                _id: id,
                userId,
            });

        if (!order) {
            return res.status(404).json({
                message:
                    "Card order not found",
            });
        }

        if (
            order.status !==
            "DELIVERED"
        ) {
            return res.status(400).json({
                message:
                    "Card order cannot be activated in its current status",
            });
        }

        if (!order.cardId) {
            return res.status(400).json({
                message:
                    "Physical card is not issued",
            });
        }

        const card =
            await Card.findOne({
                _id: order.cardId,
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
                    "Physical card is already active",
            });
        }

        card.isActive = true;

        await card.save();

        order.status = "ACTIVATED";
        order.activatedAt = new Date();

        await order.save();

        return res.status(200).json({
            id: order._id,
            type: order.type,
            status: order.status,
            deliveryAddress: order.deliveryAddress,
            cardColor: order.cardColor,
            specialistName: order.specialistName,
            scheduledAt: order.scheduledAt,
            deliveredAt: order.deliveredAt,
            activatedAt: order.activatedAt,
            cardId: order.cardId,
        });
    } catch (error) {
        console.error(
            "Activate card order error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }

};