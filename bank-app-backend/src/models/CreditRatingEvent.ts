import mongoose from "mongoose";

const CreditRatingEventSchema =
    new mongoose.Schema(
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            loanId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Loan",
                required: true,
            },

            type: {
                type: String,
                enum: [
                    "PAYMENT_ON_TIME",
                    "PAYMENT_LATE",
                    "LOAN_PAID",
                    "LOAN_DEFAULTED",
                ],
                required: true,
            },

            points: {
                type: Number,
                required: true,
            },

            scoreBefore: {
                type: Number,
                required: true,
                min: 300,
                max: 850,
            },

            scoreAfter: {
                type: Number,
                required: true,
                min: 300,
                max: 850,
            },
        },
        {
            timestamps: true,
        }
    );

export default mongoose.model(
    "CreditRatingEvent",
    CreditRatingEventSchema
);