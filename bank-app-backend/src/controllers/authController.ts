import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import VerificationCode from "../models/VerificationCode";
import { Request, Response } from "express";
import { generateOtp } from "../utils/otp";

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (
        !existingUser.isEmailVerified &&
        existingUser.emailVerificationBlockedUntil &&
        existingUser.emailVerificationBlockedUntil > new Date()
      ) {

        return res.status(403).json({
          code: "REGISTRATION_BLOCKED",
          message: `You have exhausted all verification attempts.`,
          retryAt: existingUser.emailVerificationBlockedUntil,
        });
      }

      return res.status(400).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      passwordHash,
      isEmailVerified: false,
      emailVerificationAttempts: 0,
      emailVerificationBlockedUntil: null,
      deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await generateOtp(email, user._id.toString());

    return res.status(201).json({
      message: "User created. Please verify your email.",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
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

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });

    const record = await VerificationCode.findOne({ email, used: false });
    if (!record) return res.status(400).json({ message: "Invalid code" });

    if (record.expiresAt < new Date()) return res.status(400).json({ message: "Code expired" });

    const isMatch = await bcrypt.compare(code, record.codeHash);
    if (!isMatch) {
      record.attemptsLeft -= 1;

      if (record.attemptsLeft <= 0) {
        record.status = "BLOCKED";
        await record.save();

        user.emailVerificationBlockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        return res.status(403).json({
          message: "NO_ATTEMPTS_LEFT",
          blockedUntil: user.emailVerificationBlockedUntil,
        });
      }

      await record.save();
      return res.status(400).json({ message: "Invalid code", attemptsLeft: record.attemptsLeft });
    }

    record.used = true;
    record.status = "USED";
    await record.save();

    user.isEmailVerified = true;
    user.emailVerificationAttempts = 0;
    user.emailVerificationBlockedUntil = null;
    user.deleteAt = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });

    if (user.emailVerificationBlockedUntil && user.emailVerificationBlockedUntil > new Date()) {
      return res.status(403).json({
        message: "Verification blocked. Try again later.",
        blockedUntil: user.emailVerificationBlockedUntil,
      });
    }

    await generateOtp(email, user._id.toString());

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.emailVerificationBlockedUntil &&
      user.emailVerificationBlockedUntil > new Date()
    ) {
      return res.status(403).json({
        message: "Verification blocked. Try again later",
        blockedUntil: user.emailVerificationBlockedUntil,
      });
    }

    await generateOtp(email, user._id.toString());

    user.emailVerificationAttempts = 0;
    user.emailVerificationBlockedUntil = null;

    await user.save();

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};