import express from "express";

import {
    createCardOrder,
    getCurrentCardOrder,
    scheduleCardOrder,
    deliverCardOrder,
    activateCardOrder
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

router.patch(
    "/:id/deliver",
    authMiddleware,
    deliverCardOrder
);

router.patch(
    "/:id/activate",
    authMiddleware,
    activateCardOrder
);

export default router;