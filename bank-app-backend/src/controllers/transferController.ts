import { Request, Response } from "express";
import Transaction from "../models/Transaction";

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const { to, amount } = req.body;

    const userId = (req as any).userId;

    const transaction = await Transaction.create({
      from: userId,
      to,
      amount,
      type: "transfer",
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};