
import { Response } from "express";
import mongoose from "mongoose";

import Card from "../models/Card";
import Transaction from "../models/Transaction";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

const TARGET_BALANCE = 1500;
const COOLDOWN_HOURS = 48;
const CURRENCY = "USD";

class TopUpError extends Error {
  retryAt: Date | undefined;

  constructor(
    message: string,
    statusCode: number,
    retryAt?: Date,
  ) {
    super(message);
    this.name = "TopUpError";
    this.statusCode = statusCode;
    this.retryAt = retryAt;
  }

  statusCode: number;
}

const roundToCents = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const createTestTopUp = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const session = await mongoose.startSession();

  try {
    let result: {
      success: boolean;
      amount: number;
      currency: string;
      totalBalanceBefore: number;
      totalBalanceAfter: number;
      retryAt: string;
    } | null = null;

    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);

      if (!user) {
        throw new TopUpError("User not found", 404);
      }

      const now = new Date();
      const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
      const cutoff = new Date(now.getTime() - cooldownMs);

      const cards = await Card.find({
        userId,
        type: "DEBIT",
        currency: CURRENCY,
        isClosed: false,
      }).session(session);

      const totalBalanceBefore = roundToCents(
        cards.reduce((total, card) => total + card.balance, 0),
      );

      if (totalBalanceBefore >= TARGET_BALANCE) {
        throw new TopUpError("Your total USD debit card balance must be below $1500", 400);
      }

      const destinationCard = await Card.findOne({
        userId,
        type: "DEBIT",
        currency: CURRENCY,
        isActive: true,
        isFrozen: false,
        isClosed: false,
      })
        .sort({ createdAt: 1 })
        .session(session);

      if (!destinationCard) {
        throw new TopUpError("No active, unfrozen USD debit card is available", 400);
      }

      const claimedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          $or: [
            { lastTestTopUpAt: null },
            { lastTestTopUpAt: { $exists: false } },
            { lastTestTopUpAt: { $lte: cutoff } },
          ],
        },
        {
          $set: {
            lastTestTopUpAt: now,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!claimedUser) {
        const latestUser = await User.findById(userId).select("lastTestTopUpAt").session(session);
        const lastTopUpAt = latestUser?.get("lastTestTopUpAt") as Date | null;
        const retryAt = lastTopUpAt ? new Date(lastTopUpAt.getTime() + cooldownMs) : undefined;

        throw new TopUpError("Test balance can only be topped up once every 48 hours", 429, retryAt);
      }

      const amount = roundToCents(TARGET_BALANCE - totalBalanceBefore);

      const updatedCard = await Card.findOneAndUpdate(
        {
          _id: destinationCard._id,
          userId,
          type: "DEBIT",
          currency: CURRENCY,
          isActive: true,
          isFrozen: false,
          isClosed: false,
        },
        {
          $inc: {
            balance: amount,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedCard) {
        throw new TopUpError(
          "The destination card is no longer available",
          409,
        );
      }

      await Transaction.create(
        [
          {
            to: userId,
            toCard: updatedCard._id,
            amount,
            currency: CURRENCY,
            type: "test_top_up",
          },
        ],
        { session },
      );

      result = {
        success: true,
        amount,
        currency: CURRENCY,
        totalBalanceBefore,
        totalBalanceAfter: roundToCents(totalBalanceBefore + amount),
        retryAt: new Date(now.getTime() + cooldownMs).toISOString(),
      };
    });

    if (!result) {
      return res.status(500).json({
        message: "Failed to complete test top-up",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof TopUpError) {
      return res.status(error.statusCode).json({
        message: error.message,
        ...(error.retryAt
          ? { retryAt: error.retryAt.toISOString() }
          : {}),
      });
    }

    console.error("Test top-up error:", error);

    return res.status(500).json({
      message: "Failed to complete test top-up",
    });
  } finally {
    await session.endSession();
  }
};