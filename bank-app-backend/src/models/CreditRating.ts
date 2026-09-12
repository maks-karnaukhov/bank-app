import mongoose from "mongoose";

const CreditRatingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        score: {
            type: Number,
            required: true,
            min: 300,
            max: 850,
            default: 650,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "CreditRating",
    CreditRatingSchema
);