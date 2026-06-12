import bcrypt from "bcrypt";
import VerificationCode from "../models/VerificationCode";

export const generateOtp = async (email: string, userId: string) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await VerificationCode.deleteMany({ email, used: false });

  await VerificationCode.create({
    userId,
    email,
    codeHash,
    expiresAt,
    attemptsLeft: 3,
    status: "ACTIVE",
    used: false,
  });

  console.log("OTP:", code);
  return code;
};