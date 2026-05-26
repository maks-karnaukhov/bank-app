import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";

import { getTransactions } from "../controllers/transactionController";
import { createTransfer } from "../controllers/transferController";

const router = express.Router();

router.get("/", authMiddleware, getTransactions);
router.post("/transfer", authMiddleware, createTransfer);

export default router;