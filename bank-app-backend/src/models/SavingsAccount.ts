import mongoose from "mongoose";

const SavingsAccountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        purpose: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        goalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        balance: {
            type: Number,
            default: 0,
            min: 0,
        },

        currency: {
            type: String,
            default: "USD",
        },

        interestRate: {
            type: Number,
            required: true,
            min: 0,
        },

        lastInterestAppliedAt: {
            type: Date,
            default: Date.now,
        },

        isClosed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

SavingsAccountSchema.index({
    userId: 1,
    isClosed: 1,
});

export default mongoose.model(
    "SavingsAccount",
    SavingsAccountSchema
);