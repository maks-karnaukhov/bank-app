import express from "express";
import multer from "multer";

import {
  register,
  login,
  verifyOtp,
  requestOtp,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
  uploadCurrentUserAvatar,
} from "../controllers/authController";

import { authMiddleware } from "../middleware/authMiddleware";
import { uploadAvatar } from "../middleware/avatarUpload";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/request-otp", requestOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/me", authMiddleware, updateCurrentUser);
router.post(
  "/avatar",
  authMiddleware,
  (req, res, next) => {
    uploadAvatar(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            message: "Avatar must not exceed 5 MB",
          });
        }

        return res.status(400).json({
          message: "Avatar upload failed",
          code: error.code,
        });
      }

      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  },
  uploadCurrentUserAvatar
);


export default router;