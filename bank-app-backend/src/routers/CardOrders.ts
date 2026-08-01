import express from "express";

import {
    createCardOrder,
    getCurrentCardOrder,
    scheduleCardOrder
} from "../controllers/CardOrderController";

import {
    authMiddleware,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
    "/current",
    authMiddleware,
    getCurrentCardOrder
);

router.post(
    "/",
    authMiddleware,
    createCardOrder
);

router.patch(
    "/:id/schedule",
    authMiddleware,
    scheduleCardOrder
);

export default router;