import { Response } from "express";

import Card from "../models/Card";

import { AuthRequest } from "../middleware/authMiddleware";

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

        const safeCards = cards.map((card) => ({
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
        }));


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