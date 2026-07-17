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

    purpose: {
      type: String,
      enum: [
        "EMAIL_VERIFY",
        "PASSWORD_RESET",
      ],
      required: true,
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
      enum: [
        "ACTIVE",
        "EXPIRED",
        "BLOCKED",
        "USED",
      ],
      default: "ACTIVE",
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