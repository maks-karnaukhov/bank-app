import {
    calculateLoanPayment,
} from "./loanPaymentService";

import LoanPaymentSchedule from "../models/LoanPaymentSchedule";
import {
    applyCreditRatingEvent,
} from "./creditRatingService";

type LoanPaymentScheduleInput = {
    userId: string;
    loanId: string;
    amount: number;
    termMonths: number;
    monthlyPayment: number;
    annualInterestRate: number;
    startDate: Date;
};

type LoanPaymentScheduleItem = {
    userId: string;
    loanId: string;
    installmentNumber: number;
    dueDate: Date;
    scheduledAmount: number;
    principalAmount: number;
    interestAmount: number;
    remainingPrincipal: number;
    status: "PENDING";
    paidAt: null;
};

const addOneMonth = (
    date: Date
): Date => {
    const result = new Date(date);

    const originalDay = result.getDate();

    result.setDate(1);
    result.setMonth(result.getMonth() + 1);

    const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();

    result.setDate(Math.min(originalDay, lastDayOfMonth));

    return result;
};

export const generateLoanPaymentSchedule = ({
    userId,
    loanId,
    amount,
    termMonths,
    monthlyPayment,
    annualInterestRate,
    startDate,
}: LoanPaymentScheduleInput):
    LoanPaymentScheduleItem[] => {
    if (
        amount <= 0 ||
        termMonths <= 0 ||
        monthlyPayment <= 0
    ) {
        throw new Error("Invalid loan payment schedule parameters");
    }

    const schedule: LoanPaymentScheduleItem[] = [];

    let remainingPrincipal = amount;

    let dueDate = addOneMonth(startDate);

    for (
        let installmentNumber = 1;
        installmentNumber <= termMonths;
        installmentNumber += 1
    ) {
        const calculation =
            calculateLoanPayment({
                remainingPrincipal,
                monthlyPayment,
                annualInterestRate,
            });

        schedule.push({
            userId,
            loanId,
            installmentNumber,
            dueDate,
            scheduledAmount: calculation.paymentAmount,
            principalAmount: calculation.principalAmount,
            interestAmount: calculation.interestAmount,
            remainingPrincipal: calculation.remainingPrincipal,
            status: "PENDING",
            paidAt: null,
        });

        remainingPrincipal = calculation.remainingPrincipal;
        dueDate = addOneMonth(dueDate);

        if (remainingPrincipal <= 0) {
            break;
        }
    }

    return schedule;
};

export const markOverdueLoanPayments = async (
    userId: string
) => {
    const now = new Date();

    const overduePayments =
        await LoanPaymentSchedule.find({
            userId,
            status: "PENDING",
            dueDate: {
                $lt: now,
            },
        }).sort({
            dueDate: 1,
        });

    if (overduePayments.length === 0) {
        return [];
    }

    const processedPayments = [];

    for (const payment of overduePayments) {
        payment.status = "LATE";
        payment.lateAt = now;

        await payment.save();

        await applyCreditRatingEvent({
            userId,
            loanId: payment.loanId.toString(),
            type: "PAYMENT_LATE",
        });

        processedPayments.push(payment);
    }

    return processedPayments;
};