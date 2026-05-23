import User from "../models/User";
import VerificationCode from "../models/VerificationCode";
import { Request, Response } from "express";

export const verifyEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    const record = await VerificationCode.findOne({
      email,
      code,
      used: false,
    });

    if (!record) {
      return res.status(400).json({
        message: "Invalid code",
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Code expired",
      });
    }

    record.used = true;
    await record.save();

    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};