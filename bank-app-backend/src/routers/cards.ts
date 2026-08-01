import express from "express";

import {
    getCards,
    createVirtualCard,
    getCardById,
    revealCardDetails,
    getCardRevealStatus,
    activateCard
} from "../controllers/cardController";

import {
    authMiddleware,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getCards
);

router.post(
    "/virtual",
    authMiddleware,
    createVirtualCard
);

router.post(
    "/:id/activate",
    authMiddleware,
    activateCard
);

router.get(
    "/:id",
    authMiddleware,
    getCardById
);

router.post(
    "/:id/reveal",
    authMiddleware,
    revealCardDetails
);

router.get(
    "/:id/reveal-status",
    authMiddleware,
    getCardRevealStatus
);

export default router;