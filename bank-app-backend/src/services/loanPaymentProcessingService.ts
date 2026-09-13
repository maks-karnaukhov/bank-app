import mongoose from "mongoose";

import Loan from "../models/Loan";
import LoanPayment from "../models/LoanPayment";
import LoanPaymentSchedule from "../models/LoanPaymentSchedule";

import {
    calculateLoanPayment,
} from "./loanPaymentService";

type ProcessLoanPaymentInput = {
    userId: string;
    loanId: string;
    session?: mongoose.ClientSession;
};

export const processLoanPayment = async ({
    userId,
    loanId,
    session,
}: ProcessLoanPaymentInput) => {
    const loanQuery = Loan.findOne({
        _id: loanId,
        userId,
    });

    if (session) {
        loanQuery.session(session);
    }

    const loan = await loanQuery;

    if (!loan) {
        throw new Error("LOAN_NOT_FOUND");
    }

    if (loan.status !== "ACTIVE") {
        throw new Error("LOAN_NOT_ACTIVE");
    }

    if (loan.remainingPrincipal <= 0) {
        throw new Error("LOAN_ALREADY_PAID");
    }

    const scheduleQuery =
        LoanPaymentSchedule.findOne({
            loanId: loan._id,
            userId,
            status: {
                $in: [
                    "PENDING",
                    "LATE",
                ],
            },
        }).sort({
            installmentNumber: 1,
        });

    if (session) {
        scheduleQuery.session(session);
    }

    const scheduleItem = await scheduleQuery;

    if (!scheduleItem) {
        throw new Error(
            "PAYMENT_SCHEDULE_NOT_FOUND"
        );
    }

    const wasLate = scheduleItem.status === "LATE";

    const calculation =
        calculateLoanPayment({
            remainingPrincipal: loan.remainingPrincipal,
            monthlyPayment: loan.monthlyPayment,
            annualInterestRate: loan.interestRate,
        });

    const paidAt = new Date();

    const paymentData = {
        userId,
        loanId: loan._id,
        amount: calculation.paymentAmount,
        principalAmount: calculation.principalAmount,
        interestAmount: calculation.interestAmount,
        remainingAmount: calculation.remainingPrincipal,
        status: "COMPLETED" as const,
        paidAt,
    };

    const payment = session
        ? (
            await LoanPayment.create(
                [paymentData],
                { session }
            )
        )[0]
        : await LoanPayment.create(
            paymentData
        );

    if (!payment) {
        throw new Error("PAYMENT_CREATION_FAILED");
    }

    loan.remainingPrincipal = calculation.remainingPrincipal;
    loan.remainingAmount = Math.max(0, loan.remainingAmount - calculation.paymentAmount);

    const loanPaid = loan.remainingPrincipal <= 0;

    if (loanPaid) {
        loan.remainingPrincipal = 0;
        loan.remainingAmount = 0;
        loan.status = "PAID";
    }

    await loan.save(session ? { session } : undefined);

    scheduleItem.status = "PAID";
    scheduleItem.paidAt = paidAt;

    await scheduleItem.save(session ? { session } : undefined);

    return {
        payment,
        loan,
        scheduleItem,
        wasLate,
        loanPaid,
    };
};