
import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware";
import {
    createTransfer,
    lookupTransferRecipient,
} from "../controllers/transferController";

const router = Router();

router.get(
    "/recipient",
    authMiddleware,
    lookupTransferRecipient,
);

router.post(
    "/",
    authMiddleware,
    createTransfer,
);

export default router;