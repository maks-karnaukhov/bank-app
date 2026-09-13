import Loan from "../models/Loan";
import Card from "../models/Card";
import LoanAutoPayment from "../models/LoanAutoPayment";

import {
    processLoanPayment,
} from "./loanPaymentProcessingService";

import { markOverdueLoanPayments } from "./loanPaymentScheduleService";

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

    const existingAutoPayment =
        await LoanAutoPayment.findOne({
            userId,
            loanId,
        });

    if (existingAutoPayment) {
        existingAutoPayment.cardId = card._id;
        existingAutoPayment.isEnabled = true;

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

    const autoPayment =
        await LoanAutoPayment.findOne({
            userId,
            loanId,
            isEnabled: true,
        });

    if (!autoPayment) {
        throw new Error(
            "AUTO_PAYMENT_NOT_FOUND"
        );
    }

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

    if (loan.remainingPrincipal <= 0) {
        throw new Error(
            "LOAN_ALREADY_PAID"
        );
    }

    const card = await Card.findOne({
        _id: autoPayment.cardId,
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

    const paymentAmount =
        loan.monthlyPayment;

    if (card.balance < paymentAmount) {
        throw new Error(
            "INSUFFICIENT_FUNDS"
        );
    }

    const updatedCard =
        await Card.findOneAndUpdate(
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
            }
        );

    if (!updatedCard) {
        throw new Error(
            "INSUFFICIENT_FUNDS"
        );
    }

    const result =
        await processLoanPayment({
            userId,
            loanId,
        });

    return {
        success: true,
        payment: result.payment,
        loan: result.loan,
        schedule: result.scheduleItem,
        card: updatedCard,
        wasLate: result.wasLate,
        loanPaid: result.loanPaid,
    };
};