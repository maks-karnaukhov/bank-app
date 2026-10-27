import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";

import { getTransactions } from "../controllers/transactionController";
import { createTransfer } from "../controllers/transferController";
import { createTestTopUp } from "../controllers/testTopUpController";

const router = express.Router();

router.get("/", authMiddleware, getTransactions);
router.post("/transfer", authMiddleware, createTransfer);
router.post("/test-top-up", authMiddleware, createTestTopUp);

export default router;