import express from "express";

import {
    createCustomerFinancialProfile,
    updateCustomerFinancialProfile,
} from "../controllers/customerFinancialProfileController";

import {
    authMiddleware,
} from "../middleware/authMiddleware";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createCustomerFinancialProfile
);

router.patch(
    "/",
    authMiddleware,
    updateCustomerFinancialProfile
);

export default router;