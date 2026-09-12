import express from "express";

import {
    getCurrentCreditRating,
    getCreditRatingEvents,
} from "../controllers/creditRatingController";

import {
    authMiddleware,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getCurrentCreditRating
);

router.get(
    "/events",
    authMiddleware,
    getCreditRatingEvents
);

export default router;