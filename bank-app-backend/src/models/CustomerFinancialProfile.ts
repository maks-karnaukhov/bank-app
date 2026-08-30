import mongoose from "mongoose";

const CustomerFinancialProfileSchema =
    new mongoose.Schema(
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                unique: true,
            },

            dateOfBirth: {
                type: Date,
                required: true,
            },

            monthlyIncome: {
                type: Number,
                required: true,
                min: 0,
            },

            monthlyExternalDebtPayments: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },

            employmentType: {
                type: String,
                enum: [
                    "EMPLOYED",
                    "SELF_EMPLOYED",
                    "ENTREPRENEUR",
                    "UNEMPLOYED",
                    "OTHER",
                ],
                required: true,
            },

            employmentStartDate: {
                type: Date,
                required: true,
            },
        },
        {
            timestamps: true,
        }
    );

export default mongoose.model(
    "CustomerFinancialProfile",
    CustomerFinancialProfileSchema
);