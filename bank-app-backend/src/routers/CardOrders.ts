import express from "express";

import {
    createCardOrder,
    createCreditCard,
    getCurrentCardOrder,
    scheduleCardOrder,
    deliverCardOrder,
    activateCardOrder,
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

router.post(
    "/credit",
    authMiddleware,
    createCreditCard
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