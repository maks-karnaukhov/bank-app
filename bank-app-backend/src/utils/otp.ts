import bcrypt from "bcrypt";
import VerificationCode from "../models/VerificationCode";
import { sendOtpEmail } from "./email";

export type OtpPurpose =
  | "EMAIL_VERIFY"
  | "PASSWORD_RESET";

export const generateOtp = async (email: string, userId: string,  purpose: OtpPurpose) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 10);

  const expiresAt = new Date(Date.now() + 90 * 1000);

  await VerificationCode.deleteMany({
    email,
    purpose,
    used: false,
  });

  await VerificationCode.create({
    userId,
    email,
    purpose,
    codeHash,
    expiresAt,
    attemptsLeft: 3,
    status: "ACTIVE",
    used: false,
  });

  await sendOtpEmail(email, code);

  return code;
};