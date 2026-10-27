import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationBlockedUntil: {
      type: Date,
      default: null,
    },

    emailVerificationAttempts: {
      type: Number,
      default: 0,
    },

    deleteAt: {
      type: Date,
      default: null,
    },

    lastTestTopUpAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index(
  { deleteAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      isEmailVerified: false,
    },
  }
);

export default mongoose.model("User", UserSchema);