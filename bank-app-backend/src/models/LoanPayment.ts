import mongoose from "mongoose";

const LoanPaymentSchema =
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

            amount: {
                type: Number,
                required: true,
                min: 0,
            },

            principalAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            interestAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            remainingAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            status: {
                type: String,
                enum: [
                    "COMPLETED",
                    "FAILED",
                ],
                default: "COMPLETED",
            },

            paidAt: {
                type: Date,
                default: Date.now,
            },
        },
        {
            timestamps: true,
        }
    );

LoanPaymentSchema.index({
    loanId: 1,
    paidAt: -1,
});

LoanPaymentSchema.index({
    userId: 1,
    paidAt: -1,
});

export default mongoose.model(
    "LoanPayment",
    LoanPaymentSchema
);