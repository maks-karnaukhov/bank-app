import bcrypt from "bcrypt";
import User from "../models/User";
import VerificationCode from "../models/VerificationCode";
import { Request, Response } from "express";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      middleName,
      phone,
      email,
      password,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      middleName,
      phone,
      email,
      passwordHash,
      isEmailVerified: false,
    });

    const code = generateCode();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await VerificationCode.create({
      userId: user._id,
      email,
      code,
      expiresAt,
      used: false,
    });

    console.log("Verification code:", code);

    return res.status(201).json({
      message: "User created. Verify email.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};