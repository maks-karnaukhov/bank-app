import mongoose from "mongoose";

const CardRevealAttemptSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        cardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card",
            required: true,
        },

        attemptsLeft: {
            type: Number,
            default: 5,
        },

        blockedUntil: {
            type: Date,
            default: null,
        },


    },
    {
        timestamps: true,
    }
);

CardRevealAttemptSchema.index(
    {
        userId: 1,
        cardId: 1,
    },
    {
        unique: true,
    }
);

export default mongoose.model(
    "CardRevealAttempt",
    CardRevealAttemptSchema
);