import mongoose from "mongoose";

import Loan from "../models/Loan";
import LoanPaymentSchedule from "../models/LoanPaymentSchedule";
import LoanPayment from "../models/LoanPayment";
import Card from "../models/Card";

type LoanPaymentCalculationInput = {
    remainingPrincipal: number;
    monthlyPayment: number;
    annualInterestRate: number;
};

type LoanPaymentCalculationResult = {
    paymentAmount: number;
    principalAmount: number;
    interestAmount: number;
    remainingPrincipal: number;
};

type GetCardInput = {
    cardId: string;
    userId: string;
    session: mongoose.ClientSession;
};

type MakeLoanPaymentInput = {
    loanId: string;
    userId: string;
    cardId: string;
};

type ScheduledLoanPaymentResult = {
    amount: number;
    payment: {
        _id: mongoose.Types.ObjectId;
        loanId: mongoose.Types.ObjectId;
        installmentNumber: number;
        dueDate: Date;
        scheduledAmount: number;
        principalAmount: number;
        interestAmount: number;
        remainingPrincipal: number;
        status: string;
        paidAt: Date | null;
    };
    loan: {
        id: mongoose.Types.ObjectId;
        remainingAmount: number;
        remainingPrincipal: number;
        status: string;
    };
    transaction: {
        _id: mongoose.Types.ObjectId;
        loanId: mongoose.Types.ObjectId;
        cardId: mongoose.Types.ObjectId;
        amount: number;
        principalAmount: number;
        interestAmount: number;
        remainingAmount: number;
        type: string;
        status: string;
        paidAt: Date;
    };
};

type EarlyLoanRepaymentResult = {
    amount: number;
    loan: {
        id: mongoose.Types.ObjectId;
        remainingAmount: number;
        remainingPrincipal: number;
        status: string;
        nextPaymentDate: null;
    };
    transaction: {
        _id: mongoose.Types.ObjectId;
        loanId: mongoose.Types.ObjectId;
        cardId: mongoose.Types.ObjectId;
        amount: number;
        principalAmount: number;
        interestAmount: number;
        remainingAmount: number;
        type: string;
        status: string;
        paidAt: Date;
    };
};

const getActiveCard = async ({
    cardId,
    userId,
    session,
}: GetCardInput) => {
    const card = await Card.findOne({
        _id: cardId,
        userId,
        isActive: true,
        isFrozen: false,
        isClosed: false,
    }).session(session);

    if (!card) {
        throw new Error("CARD_NOT_FOUND");
    }

    return card;
};

const roundMoney = (value: number): number => {
    return Math.round(value * 100) / 100;
};

const debitCard = async ({
    card,
    amount,
    session,
}: {
    card: Awaited<ReturnType<typeof getActiveCard>>;
    amount: number;
    session: mongoose.ClientSession;
}) => {
    if (card.balance < amount) {
        throw new Error("INSUFFICIENT_FUNDS");
    }

    card.balance = roundMoney(card.balance - amount);

    await card.save({ session });
};

export const makeScheduledLoanPayment = async ({
    loanId,
    userId,
    cardId,
}: MakeLoanPaymentInput): Promise<ScheduledLoanPaymentResult> => {
    const session = await mongoose.startSession();

    try {
        let result: ScheduledLoanPaymentResult | undefined;

        await session.withTransaction(async () => {
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

            const payment = await LoanPaymentSchedule.findOne({
                loanId,
                userId,
                status: {
                    $in: ["PENDING", "LATE"],
                },
            })
                .sort({ installmentNumber: 1 })
                .session(session);

            if (!payment) {
                throw new Error("NO_PENDING_PAYMENT");
            }

            const card = await getActiveCard({
                cardId,
                userId,
                session,
            });

            const amount = payment.scheduledAmount;

            await debitCard({
                card,
                amount,
                session,
            });

            const paidAt = new Date();

            payment.status = "PAID";
            payment.paidAt = paidAt;

            await payment.save({ session });

            loan.remainingPrincipal = roundMoney(
                Math.max(
                    0,
                    loan.remainingPrincipal - payment.principalAmount
                )
            );

            loan.remainingAmount = roundMoney(
                Math.max(
                    0,
                    loan.remainingAmount - payment.scheduledAmount
                )
            );

            if (
                loan.remainingPrincipal <= 0 ||
                loan.remainingAmount <= 0
            ) {
                loan.remainingPrincipal = 0;
                loan.remainingAmount = 0;
                loan.status = "PAID";
            }

            await loan.save({ session });

            const transactions = await LoanPayment.create(
                [
                    {
                        userId,
                        loanId: loan._id,
                        cardId: card._id,
                        amount,
                        principalAmount: payment.principalAmount,
                        interestAmount: payment.interestAmount,
                        remainingAmount: loan.remainingAmount,
                        type: "SCHEDULED",
                        installmentId: payment._id,
                        status: "COMPLETED",
                        paidAt,
                    },
                ],
                { session }
            );

            const createdTransaction = transactions[0];

            if (!createdTransaction) {
                throw new Error("LOAN_PAYMENT_CREATION_FAILED");
            }

            result = {
                amount,
                payment: {
                    _id: payment._id,
                    loanId: payment.loanId,
                    installmentNumber: payment.installmentNumber,
                    dueDate: payment.dueDate,
                    scheduledAmount: payment.scheduledAmount,
                    principalAmount: payment.principalAmount,
                    interestAmount: payment.interestAmount,
                    remainingPrincipal: payment.remainingPrincipal,
                    status: payment.status,
                    paidAt: payment.paidAt,
                },
                loan: {
                    id: loan._id,
                    remainingAmount: loan.remainingAmount,
                    remainingPrincipal: loan.remainingPrincipal,
                    status: loan.status,
                },
                transaction: {
                    _id: createdTransaction._id,
                    loanId: createdTransaction.loanId,
                    cardId: createdTransaction.cardId,
                    amount: createdTransaction.amount,
                    principalAmount: createdTransaction.principalAmount,
                    interestAmount: createdTransaction.interestAmount,
                    remainingAmount: createdTransaction.remainingAmount,
                    type: createdTransaction.type,
                    status: createdTransaction.status,
                    paidAt: createdTransaction.paidAt,
                },
            };
        });

        if (!result) {
            throw new Error("LOAN_PAYMENT_RESULT_NOT_CREATED");
        }

        return result;
    } finally {
        await session.endSession();
    }
};

export const calculateLoanPayment = ({
    remainingPrincipal,
    monthlyPayment,
    annualInterestRate,
}: LoanPaymentCalculationInput): LoanPaymentCalculationResult => {
    if (
        remainingPrincipal <= 0 ||
        monthlyPayment <= 0 ||
        annualInterestRate < 0
    ) {
        throw new Error("Invalid loan payment parameters");
    }

    const monthlyInterestRate = annualInterestRate / 100 / 12;
    const interestAmount = roundMoney(
        remainingPrincipal * monthlyInterestRate
    );

    let principalAmount = monthlyPayment - interestAmount;

    if (principalAmount < 0) {
        principalAmount = 0;
    }

    if (principalAmount > remainingPrincipal) {
        principalAmount = remainingPrincipal;
    }

    principalAmount = roundMoney(principalAmount);

    const paymentAmount = roundMoney(principalAmount + interestAmount);
    const remainingPrincipalAmount = roundMoney(
        Math.max(0, remainingPrincipal - principalAmount)
    );

    return {
        paymentAmount,
        principalAmount,
        interestAmount,
        remainingPrincipal: remainingPrincipalAmount,
    };
};

export const makeEarlyLoanRepayment = async ({
    loanId,
    userId,
    cardId,
}: MakeLoanPaymentInput): Promise<EarlyLoanRepaymentResult> => {
    const session = await mongoose.startSession();

    try {
        let result: EarlyLoanRepaymentResult | undefined;

        await session.withTransaction(async () => {
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

            const amount = roundMoney(loan.remainingPrincipal);

            if (amount <= 0) {
                throw new Error("LOAN_ALREADY_PAID");
            }

            const card = await getActiveCard({
                cardId,
                userId,
                session,
            });

            await debitCard({
                card,
                amount,
                session,
            });

            await LoanPaymentSchedule.updateMany(
                {
                    loanId: loan._id,
                    userId,
                    status: {
                        $in: ["PENDING", "LATE", "MISSED"],
                    },
                },
                {
                    $set: {
                        status: "CANCELLED",
                    },
                },
                { session }
            );

            loan.remainingPrincipal = 0;
            loan.remainingAmount = 0;
            loan.status = "PAID";

            await loan.save({ session });

            const paidAt = new Date();

            const transactions = await LoanPayment.create(
                [
                    {
                        userId,
                        loanId: loan._id,
                        cardId: card._id,
                        amount,
                        principalAmount: amount,
                        interestAmount: 0,
                        remainingAmount: 0,
                        type: "EARLY_REPAYMENT",
                        installmentId: null,
                        status: "COMPLETED",
                        paidAt,
                    },
                ],
                { session }
            );

            const createdTransaction = transactions[0];

            if (!createdTransaction) {
                throw new Error("EARLY_REPAYMENT_CREATION_FAILED");
            }

            result = {
                amount,
                loan: {
                    id: loan._id,
                    remainingAmount: 0,
                    remainingPrincipal: 0,
                    status: "PAID",
                    nextPaymentDate: null,
                },
                transaction: {
                    _id: createdTransaction._id,
                    loanId: createdTransaction.loanId,
                    cardId: createdTransaction.cardId,
                    amount: createdTransaction.amount,
                    principalAmount: createdTransaction.principalAmount,
                    interestAmount: createdTransaction.interestAmount,
                    remainingAmount: createdTransaction.remainingAmount,
                    type: createdTransaction.type,
                    status: createdTransaction.status,
                    paidAt: createdTransaction.paidAt,
                },
            };
        });

        if (!result) {
            throw new Error("EARLY_REPAYMENT_RESULT_NOT_CREATED");
        }

        return result;
    } finally {
        await session.endSession();
    }
};