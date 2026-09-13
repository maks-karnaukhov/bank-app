import mongoose from "mongoose";

const LoanAutoPaymentSchema =
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

            cardId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Card",
                required: true,
            },

            isEnabled: {
                type: Boolean,
                default: true,
            },
        },
        {
            timestamps: true,
        }
    );

LoanAutoPaymentSchema.index(
    {
        userId: 1,
        loanId: 1,
    },
    {
        unique: true,
    }
);

export default mongoose.model(
    "LoanAutoPayment",
    LoanAutoPaymentSchema
);