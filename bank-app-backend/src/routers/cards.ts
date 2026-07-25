import express from "express";

import {
    getCards,
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


export default router;