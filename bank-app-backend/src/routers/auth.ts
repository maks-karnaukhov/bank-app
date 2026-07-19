import express from "express";

import {
  register,
  login,
  verifyOtp,
  requestOtp,
  forgotPassword,
  resetPassword
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/request-otp", requestOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;