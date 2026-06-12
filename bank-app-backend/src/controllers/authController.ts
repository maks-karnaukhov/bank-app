import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import VerificationCode from "../models/VerificationCode";
import { Request, Response } from "express";
import { generateOtp } from "../utils/otp";

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

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const codeHash = await bcrypt.hash(code, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.create({
      userId: user._id,
      email,
      codeHash,
      expiresAt,
      attemptsLeft: 3,
      status: "ACTIVE",
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({ email });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
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

    const isMatch = await bcrypt.compare(
      code,
      record.codeHash
    );

    if (!isMatch) {
      record.attemptsLeft -= 1;

      if (record.attemptsLeft <= 0) {
        record.status = "BLOCKED";

        await record.save();

        return res.status(403).json({
          message: "NO_ATTEMPTS_LEFT",
        });
      }

      await record.save();

      return res.status(400).json({
        message: "Invalid code",
        attemptsLeft: record.attemptsLeft,
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
    console.error("VERIFY EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ message: "Already verified" });
  }

  await VerificationCode.deleteMany({ email });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const codeHash = await bcrypt.hash(code, 10);

  await VerificationCode.create({
    userId: user._id,
    email,
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attemptsLeft: 3,
  });

  console.log("Resent OTP:", code);

  return res.json({
    message: "OTP resent",
    expiresIn: 60,
  });
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    await generateOtp(email, user._id.toString());

    return res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};