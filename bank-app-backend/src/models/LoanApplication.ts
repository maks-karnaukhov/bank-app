import mongoose from "mongoose";

const LoanApplicationSchema =
    new mongoose.Schema(
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            amount: {
                type: Number,
                required: true,
            },

            termMonths: {
                type: Number,
                required: true,
            },

            purpose: {
                type: String,
                enum: [
                    "CAR",
                    "EDUCATION",
                    "MEDICAL",
                    "HOME_RENOVATION",
                    "TRAVEL",
                    "OTHER",
                ],
                required: true,
            },

            creditScore: {
                type: Number,
                required: true,
            },

            decision: {
                type: String,
                enum: [
                    "AUTO_REJECTED",
                    "MANUAL_REVIEW",
                    "AUTO_APPROVED",
                ],
                required: true,
            },

            decisionReason: {
                type: String,
                required: true,
            },

            status: {
                type: String,
                enum: [
                    "PENDING",
                    "APPROVED",
                    "REJECTED",
                ],
                default: "PENDING",
            },
        },
        {
            timestamps: true,
        }
    );

export default mongoose.model(
    "LoanApplication",
    LoanApplicationSchema
);