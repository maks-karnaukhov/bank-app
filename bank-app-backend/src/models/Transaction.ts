import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
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

export default mongoose.model("Transaction", TransactionSchema);
