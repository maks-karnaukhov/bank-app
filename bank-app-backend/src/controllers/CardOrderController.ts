import { Response } from "express";

import CardOrder from "../models/CardOrder";
import Card from "../models/Card";

import { AuthRequest } from "../middleware/authMiddleware";

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

        const existingCard = await Card.findOne({
            userId,
            isActive: true,
            isVirtual: false,
        });

        if (existingCard) {
            return res.status(400).json({
                message: "Physical card already exists",
            });
        }

        const existingOrder = await CardOrder.findOne({
            userId,
            status: {
                $in: [
                    "ORDERED",
                    "PROCESSING",
                    "DELIVERY_SCHEDULED",
                ],
            },
        });

        if (existingOrder) {
            return res.status(400).json({
                message: "Physical card order already exists",
            });
        }

        const order = await CardOrder.create({
            userId,
            type: "PHYSICAL",
            status: "ORDERED",

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
            deliveryAddress: order.deliveryAddress,
            specialistName: order.specialistName,
            scheduledAt: order.scheduledAt,
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

        const order = await CardOrder.findOne({
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
            deliveryAddress: order.deliveryAddress,
            specialistName: order.specialistName,
            scheduledAt: order.scheduledAt,
            deliveredAt: order.deliveredAt,
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

        if (!specialistName || !scheduledAt) {
            return res.status(400).json({
                message:
                    "Specialist name and scheduled date are required",
            });
        }

        const date = new Date(scheduledAt);

        if (Number.isNaN(date.getTime())) {
            return res.status(400).json({
                message: "Invalid scheduled date",
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
                message: "Card order not found",
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