import mongoose from "mongoose";

const LoanAutoPaymentSchema = new mongoose.Schema(
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

        cardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card",
            required: true,
        },

        isEnabled: {
            type: Boolean,
            default: true,
        },

        lastAttemptAt: {
            type: Date,
            default: null,
        },

        lastSuccessfulPaymentAt: {
            type: Date,
            default: null,
        },

        lastError: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

LoanAutoPaymentSchema.index(
    { loanId: 1 },
    { unique: true }
);

LoanAutoPaymentSchema.index({
    userId: 1,
    isEnabled: 1,
});

export default mongoose.model(
    "LoanAutoPayment",
    LoanAutoPaymentSchema
);