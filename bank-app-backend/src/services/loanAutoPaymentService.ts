import mongoose from "mongoose";

import Loan from "../models/Loan";
import Card from "../models/Card";
import LoanAutoPayment from "../models/LoanAutoPayment";

import {
    processLoanPayment,
} from "./loanPaymentProcessingService";

import {
    markOverdueLoanPayments,
} from "./loanPaymentScheduleService";

export const enableLoanAutoPayment = async ({
    userId,
    loanId,
    cardId,
}: {
    userId: string;
    loanId: string;
    cardId: string;
}) => {
    const loan = await Loan.findOne({
        _id: loanId,
        userId,
    });

    if (!loan) {
        throw new Error("LOAN_NOT_FOUND");
    }

    if (loan.status !== "ACTIVE") {
        throw new Error("LOAN_NOT_ACTIVE");
    }

    const card = await Card.findOne({
        _id: cardId,
        userId,
    });

    if (!card) {
        throw new Error("CARD_NOT_FOUND");
    }

    if (card.isClosed) {
        throw new Error("CARD_CLOSED");
    }

    if (!card.isActive) {
        throw new Error("CARD_NOT_ACTIVE");
    }

    if (card.isFrozen) {
        throw new Error("CARD_FROZEN");
    }

    const existingAutoPayment =
        await LoanAutoPayment.findOne({
            userId,
            loanId,
        });

    if (existingAutoPayment) {
        existingAutoPayment.cardId = card._id;
        existingAutoPayment.isEnabled = true;
        existingAutoPayment.lastError = null;

        await existingAutoPayment.save();

        return existingAutoPayment;
    }

    return LoanAutoPayment.create({
        userId,
        loanId,
        cardId: card._id,
        isEnabled: true,
    });
};

export const executeLoanAutoPayment = async ({
    userId,
    loanId,
}: {
    userId: string;
    loanId: string;
}) => {

    await markOverdueLoanPayments(userId);

    const session = await mongoose.startSession();

    try {
        const result = await session.withTransaction(async () => {
            const autoPayment = await LoanAutoPayment.findOne({
                userId,
                loanId,
                isEnabled: true,
            }).session(session);

            if (!autoPayment) {
                throw new Error("AUTO_PAYMENT_NOT_FOUND");
            }

            const paymentResult = await processLoanPayment({
                userId,
                loanId,
                cardId: autoPayment.cardId.toString(),
                session,
            });

            autoPayment.lastAttemptAt = new Date();
            autoPayment.lastSuccessfulPaymentAt = paymentResult.payment.paidAt ?? new Date();
            autoPayment.lastError = null;

            await autoPayment.save({ session });

            return paymentResult;
        });

        if (!result) {
            throw new Error("AUTO_PAYMENT_FAILED");
        }

        return {
            success: true,
            payment: result.payment,
            loan: result.loan,
            schedule: result.scheduleItem,
            card: result.card,
            wasLate: result.wasLate,
            loanPaid: result.loanPaid,
        };
    } catch (error) {
        const autoPayment = await LoanAutoPayment.findOne({
            userId,
            loanId,
        });

        if (autoPayment) {
            autoPayment.lastAttemptAt = new Date();
            autoPayment.lastError =
                error instanceof Error
                    ? error.message
                    : "UNKNOWN_ERROR";

            await autoPayment.save();
        }

        throw error;
    } finally {
        await session.endSession();
    }
};

export const disableLoanAutoPayment = async ({
    userId,
    loanId,
}: {
    userId: string;
    loanId: string;
}) => {
    const autoPayment = await LoanAutoPayment.findOne({
        userId,
        loanId,
    });

    if (!autoPayment) {
        throw new Error("AUTO_PAYMENT_NOT_FOUND");
    }

    autoPayment.isEnabled = false;
    await autoPayment.save();

    return autoPayment;
};