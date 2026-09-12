import { Response } from "express";

import CreditRating from "../models/CreditRating";
import CreditRatingEvent from "../models/CreditRatingEvent";

import { AuthRequest } from "../middleware/authMiddleware";

export const getCurrentCreditRating = async (
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

        const rating = await CreditRating.findOne({
                userId,
            });

        if (!rating) {
            return res.status(404).json({
                code: "CREDIT_RATING_NOT_FOUND",
                message: "Credit rating not found",
            });
        }

        return res.status(200).json({
            id: rating._id,
            score: rating.score,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
        });
    } catch (error) {
        console.error(
            "Get current credit rating error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const getCreditRatingEvents = async (
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

        const events = await CreditRatingEvent.find({
                userId,
            }).sort({
                createdAt: -1,
            });

        return res.status(200).json(
            events.map((event) => ({
                id: event._id,
                loanId: event.loanId,
                type: event.type,
                points: event.points,
                scoreBefore: event.scoreBefore,
                scoreAfter: event.scoreAfter,
                createdAt: event.createdAt,
            }))
        );
    } catch (error) {
        console.error(
            "Get credit rating events error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};