import mongoose from "mongoose";

import Loan from "../models/Loan";
import Card from "../models/Card";
import LoanPayment from "../models/LoanPayment";
import LoanPaymentSchedule from "../models/LoanPaymentSchedule";

import {
    calculateLoanPayment,
} from "./loanPaymentService";

type ProcessLoanPaymentInput = {
    userId: string;
    loanId: string;
    cardId: string;
    session: mongoose.ClientSession;
};

export const processLoanPayment = async ({
    userId,
    loanId,
    cardId,
    session,
}: ProcessLoanPaymentInput) => {
    const loan = await Loan.findOne({
        _id: loanId,
        userId,
    }).session(session);

    if (!loan) {
        throw new Error("LOAN_NOT_FOUND");
    }

    if (loan.status !== "ACTIVE") {
        throw new Error("LOAN_NOT_ACTIVE");
    }

    if (loan.remainingPrincipal <= 0) {
        throw new Error("LOAN_ALREADY_PAID");
    }

    const card = await Card.findOne({
        _id: cardId,
        userId,
    }).session(session);

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

    const now = new Date();

    const scheduleItem =
        await LoanPaymentSchedule.findOne({
            loanId: loan._id,
            userId,
            status: {
                $in: ["PENDING", "LATE"],
            },
            dueDate: {
                $lte: now,
            },
        })
            .sort({ installmentNumber: 1 })
            .session(session);

    if (!scheduleItem) {
        throw new Error("NO_DUE_PAYMENT");
    }

    const wasLate = scheduleItem.status === "LATE";

    const calculation = calculateLoanPayment({
        remainingPrincipal: loan.remainingPrincipal,
        monthlyPayment: loan.monthlyPayment,
        annualInterestRate: loan.interestRate,
    });

    const paymentAmount = calculation.paymentAmount;

    if (paymentAmount <= 0) {
        throw new Error("INVALID_PAYMENT_AMOUNT");
    }

    const updatedCard = await Card.findOneAndUpdate(
        {
            _id: card._id,
            userId,
            isClosed: false,
            isActive: true,
            isFrozen: false,
            balance: {
                $gte: paymentAmount,
            },
        },
        {
            $inc: {
                balance: -paymentAmount,
            },
        },
        {
            new: true,
            session,
        }
    );

    if (!updatedCard) {
        throw new Error("INSUFFICIENT_FUNDS");
    }

    const paidAt = new Date();

    const loanPayment = await LoanPayment.create(
        [
            {
                userId,
                loanId: loan._id,
                cardId: updatedCard._id,
                installmentId: scheduleItem._id,
                amount: paymentAmount,
                principalAmount: calculation.principalAmount,
                interestAmount: calculation.interestAmount,
                remainingAmount: calculation.remainingPrincipal,
                type: "SCHEDULED",
                status: "COMPLETED",
                paidAt,
            },
        ],
        { session }
    );

    const payment = loanPayment[0];

    if (!payment) {
        throw new Error("PAYMENT_CREATION_FAILED");
    }

    loan.remainingPrincipal = calculation.remainingPrincipal;
    loan.remainingAmount = Math.max(0, loan.remainingAmount - paymentAmount);

    const loanPaid = loan.remainingPrincipal <= 0;

    if (loanPaid) {
        loan.remainingPrincipal = 0;
        loan.remainingAmount = 0;
        loan.status = "PAID";
    }

    await loan.save({ session });

    scheduleItem.status = "PAID";
    scheduleItem.paidAt = paidAt;

    await scheduleItem.save({ session });

    return {
        payment,
        loan,
        scheduleItem,
        card: updatedCard,
        wasLate,
        loanPaid,
    };
};