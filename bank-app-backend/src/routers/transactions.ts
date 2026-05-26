import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createTransfer,
  getTransactions,
} from "../controllers/transactionController";

const router = express.Router();

router.get("/", authMiddleware, getTransactions);
router.post("/transfer", authMiddleware, createTransfer);

export default router;