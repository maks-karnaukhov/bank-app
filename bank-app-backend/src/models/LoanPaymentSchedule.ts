import mongoose from "mongoose";

const LoanPaymentScheduleSchema =
    new mongoose.Schema(
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            loanId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Loan",
                required: true,
            },

            installmentNumber: {
                type: Number,
                required: true,
                min: 1,
            },

            dueDate: {
                type: Date,
                required: true,
            },

            scheduledAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            principalAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            interestAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            remainingPrincipal: {
                type: Number,
                required: true,
                min: 0,
            },

            status: {
                type: String,
                enum: [
                    "PENDING",
                    "PAID",
                    "LATE",
                    "MISSED",
                ],
                default: "PENDING",
            },

            paidAt: {
                type: Date,
                default: null,
            },

            lateAt: {
                type: Date,
                default: null,
            },
        },
        {
            timestamps: true,
        }
    );

LoanPaymentScheduleSchema.index({
    loanId: 1,
    installmentNumber: 1,
}, {
    unique: true,
});

LoanPaymentScheduleSchema.index({
    userId: 1,
    dueDate: 1,
});

LoanPaymentScheduleSchema.index({
    loanId: 1,
    dueDate: 1,
});

export default mongoose.model(
    "LoanPaymentSchedule",
    LoanPaymentScheduleSchema
);