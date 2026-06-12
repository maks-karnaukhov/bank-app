import mongoose from "mongoose";

const VerificationCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: {
      type: String,
      required: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attemptsLeft: {
      type: Number,
      default: 3,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "BLOCKED", "USED"],
      default: "ACTIVE",
    },

    resendAvailableAt: {
      type: Date,
      default: null,
    },

    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

VerificationCodeSchema.index({ email: 1 });
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model(
  "VerificationCode",
  VerificationCodeSchema
);