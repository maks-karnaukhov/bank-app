import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import VerificationCode from "../models/VerificationCode";
import { Request, Response } from "express";
import { generateOtp } from "../utils/otp";
import { MongoServerError } from "mongodb";

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, password, avatarUrl } = req.body;

    let user = await User.findOne({ email });

    const phoneUser = await User.findOne({ phone });

    if (phoneUser && phoneUser.email !== email) {
      return res.status(400).json({
        message: "Phone already exists",
      });
    }

    if (user?.isEmailVerified) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (
      user &&
      user.emailVerificationBlockedUntil &&
      user.emailVerificationBlockedUntil > new Date()
    ) {
      return res.status(403).json({
        code: "REGISTRATION_BLOCKED",
        message: "You have exhausted all verification attempts.",
        retryAt: user.emailVerificationBlockedUntil,
      });
    }

    if (user && !user.isEmailVerified) {
      await generateOtp(email, user._id.toString(), "EMAIL_VERIFY");

      return res.status(200).json({
        message: "Verification code resent",
        email,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      passwordHash,
      avatarUrl: avatarUrl || null,
      isEmailVerified: false,
      emailVerificationAttempts: 0,
      emailVerificationBlockedUntil: null,
      deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await generateOtp(email, user._id.toString(), "EMAIL_VERIFY");

    return res.status(201).json({
      message: "User created. Please verify your email.",
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return res.status(400).json({
        message: "Phone or email already exists",
      });
    }

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

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (
      purpose === "EMAIL_VERIFY" &&
      user.isEmailVerified
    ) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    const record = await VerificationCode.findOne({ email, purpose, used: false });
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

    if (purpose === "EMAIL_VERIFY") {
      user.isEmailVerified = true;
      user.emailVerificationAttempts = 0;
      user.emailVerificationBlockedUntil = null;
      user.deleteAt = null;

      await user.save();
    }

    if (purpose === "EMAIL_VERIFY") {
      return res.status(200).json({
        message: "Email verified successfully",
      });
    }

    return res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        message: "Email not verified",
      });
    }

    if (
      user.emailVerificationBlockedUntil &&
      user.emailVerificationBlockedUntil > new Date()
    ) {
      return res.status(403).json({
        code: "PASSWORD_RESET_BLOCKED",
        message: "You have exhausted all verification attempts.",
        retryAt: user.emailVerificationBlockedUntil,
      });
    }

    await generateOtp(email, user._id.toString(), "PASSWORD_RESET");

    return res.status(200).json({
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const requestOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, purpose } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message:"User not found",
      });
    }


    if (
      user.emailVerificationBlockedUntil &&
      user.emailVerificationBlockedUntil > new Date()
    ) {
      return res.status(403).json({
        code:"OTP_BLOCKED",
        retryAt:user.emailVerificationBlockedUntil,
      });
    }


    await generateOtp(
      email,
      user._id.toString(),
      purpose
    );


    return res.status(200).json({
      message:"OTP sent successfully",
    });

  } catch(error){

    console.error(error);

    return res.status(500).json({
      message:"Server error",
    });
  }
};

export const resetPassword = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        user.passwordHash = passwordHash;

        await user.save();

        return res.status(200).json({
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};