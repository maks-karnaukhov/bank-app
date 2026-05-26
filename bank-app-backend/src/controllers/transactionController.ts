import { Request, Response } from "express";
import Transaction from "../models/Transaction";

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const transactions = await Transaction.find({
      from: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};