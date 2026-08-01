import mongoose from "mongoose";

const CardOrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        cardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card",
            default: null,
        },

        type: {
            type: String,
            enum: ["PHYSICAL"],
            default: "PHYSICAL",
        },

        status: {
            type: String,
            enum: [
                "ORDERED",
                "PROCESSING",
                "DELIVERY_SCHEDULED",
                "DELIVERED",
                "ACTIVATED",
                "CANCELLED",
            ],
            default: "ORDERED",
        },

        deliveryAddress: {
            city: {
                type: String,
                required: true,
            },

            street: {
                type: String,
                required: true,
            },

            house: {
                type: String,
                required: true,
            },

            apartment: {
                type: String,
                required: true,
            },
        },

        specialistName: {
            type: String,
            default: null,
        },

        scheduledAt: {
            type: Date,
            default: null,
        },

        deliveredAt: {
            type: Date,
            default: null,
        },

        activatedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

CardOrderSchema.index({
    userId: 1,
    status: 1,
});

export default mongoose.model(
    "CardOrder",
    CardOrderSchema
);