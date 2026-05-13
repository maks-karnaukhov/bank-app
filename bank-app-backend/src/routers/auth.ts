import { Router } from "express";

import {
  register,
  login,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, (req: any, res) => {
  res.json({
    success: true,
    userId: req.userId,
  });
});

export default router;