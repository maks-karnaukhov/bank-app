import bcrypt from "bcrypt";
import User from "../models/User";
import VerificationCode from "../models/VerificationCode";
import { Request, Response } from "express";

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

    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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