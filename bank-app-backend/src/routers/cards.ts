import express from "express";

import {
    getCards,
    getCardDetails,
    createVirtualCard,
    getCardById,
    revealCardDetails
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
    "//details",
    authMiddleware,
    getCardDetails
);

router.post(
    "/virtual",
    authMiddleware,
    createVirtualCard
);

router.post(
    "/:cardId/details",
    authMiddleware,
    getCardDetails
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

export default router;