import express from "express";

import {
  register,
  verifyEmail,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", (req, res) => {
  res.status(200).json({
    message: "Login not implemented yet",
  });
});

export default router;