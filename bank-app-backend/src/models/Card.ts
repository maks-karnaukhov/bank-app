import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
{
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    type:{
        type:String,
        enum:[
            "DEBIT",
            "CREDIT"
        ],
        default:"DEBIT"
    },

    currency: {
        type: String,
        default: "USD",
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    name: {
        type: String,
        default: "Main card",
    },

    color: {
        type: String,
        default: "#2563eb",
    },

    encryptedNumber: {
        type: String,
        required: true,
    },

    last4: {
        type: String,
        required: true,
    },

    holderName:{
        type:String,
        required:true,
    },

    encryptedExpiryDate: {
        type: String,
        required: true,
    },

    balance:{
        type:Number,
        default:0,
    },

    creditLimit:{
        type:Number,
        default:null,
    },

    createdAt:{
        type:Date,
        default:Date.now,
    },

    network: {
        type: String,
        enum: [
            "VISA",
            "MASTERCARD",
            "MIR",
            "AMEX",
        ],
        default: "VISA",
    },

    encryptedCvv: {
        type: String,
        required: true,
    },

    isVirtual: {
        type: Boolean,
        default: true,
    },

});

CardSchema.index({
    userId: 1
});

export default mongoose.model(
    "Card",
    CardSchema
);