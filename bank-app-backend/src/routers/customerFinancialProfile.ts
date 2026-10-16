import express from "express";

import {
    createCustomerFinancialProfile,
    updateCustomerFinancialProfile,
    getCustomerFinancialProfile,
} from "../controllers/customerFinancialProfileController";

import {
    authMiddleware,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getCustomerFinancialProfile
);

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