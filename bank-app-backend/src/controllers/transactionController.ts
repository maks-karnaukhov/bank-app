import { Response } from "express";

import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const transactions = await Transaction.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("from", "email firstName lastName")
      .populate("to", "email firstName lastName")
      .populate("fromCard", "name last4")
      .populate("toCard", "name last4")
      .lean();

    const result = transactions.map((transaction: any) => {
      const type = transaction.type ?? "transfer";

      const senderId = transaction.from?._id
        ? String(transaction.from._id)
        : transaction.from
          ? String(transaction.from)
          : "";

      const recipientId = transaction.to?._id
        ? String(transaction.to._id)
        : transaction.to
          ? String(transaction.to)
          : "";

      const isTestTopUp = type === "test_top_up";
      const isOutgoing = !isTestTopUp && senderId === userId;

      return {
        id: String(transaction._id),
        type,
        from: isTestTopUp ? "Test Balance Top-Up" : transaction.from?.email ?? senderId,
        to: transaction.to?.email ?? recipientId,
        amount: transaction.amount,
        currency: transaction.currency ?? "USD",
        date: transaction.createdAt ? new Date(transaction.createdAt).toISOString() : "",
        direction: isOutgoing ? "outgoing" : "incoming",
        fromCard: transaction.fromCard ? `${transaction.fromCard.name} **** ${transaction.fromCard.last4}` : "",
        toCard: transaction.toCard ? `${transaction.toCard.name} **** ${transaction.toCard.last4}` : "",
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to load transactions:", error);

    return res.status(500).json({
      message: "Failed to load transactions",
    });
  }
};