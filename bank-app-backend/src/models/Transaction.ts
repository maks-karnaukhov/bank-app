import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fromCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },

    toCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      required: true,
      default: "USD",
    },

    type: {
      type: String,
      enum: ["transfer"],
      default: "transfer",
    },
  },
  {
    timestamps: true,
  },
);

TransactionSchema.index({ from: 1, createdAt: -1 });
TransactionSchema.index({ to: 1, createdAt: -1 });

export default mongoose.model("Transaction", TransactionSchema);