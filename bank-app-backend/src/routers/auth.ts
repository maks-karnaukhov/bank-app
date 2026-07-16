import express from "express";

import {
  register,
  login,
  verifyEmail,
  sendOtp,
  resendOtp,
  forgotPassword
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/send-otp", sendOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

export default router;