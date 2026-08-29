import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LoanApplication",
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

        interestRate: {
            type: Number,
            required: true,
        },

        monthlyPayment: {
            type: Number,
            required: true,
        },

        totalPayment: {
            type: Number,
            required: true,
        },

        totalInterest: {
            type: Number,
            required: true,
        },

        remainingAmount: {
            type: Number,
            required: true,
        },

        remainingPrincipal: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "PAID",
                "CLOSED",
            ],
            default: "ACTIVE",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Loan",
    LoanSchema
);