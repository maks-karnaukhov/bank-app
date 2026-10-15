import { api } from "./api";

export type LoanStatus =
    | "ACTIVE"
    | "PAID"
    | "CLOSED";

export type LoanPaymentStatus =
    | "PENDING"
    | "PAID"
    | "LATE"
    | "MISSED";

export type Loan = {
    id: string;
    amount: number;
    termMonths: number;
    interestRate: number;
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    remainingAmount: number;
    remainingPrincipal: number;
    status: LoanStatus;
    createdAt: string;
    nextPaymentDate: string | null;
};

export type LoanPaymentSchedule = {
    id: string;
    loanId: string;
    installmentNumber: number;
    dueDate: string;
    scheduledAmount: number;
    principalAmount: number;
    interestAmount: number;
    remainingPrincipal: number;
    status: LoanPaymentStatus;
    paidAt: string | null;
};

export const getLoans = async () => {
    return api.get<Loan[]>("/api/loans");
};

export const getLoanById = async (
    loanId: string
) => {
    return api.get<Loan>(
        `/api/loans/${loanId}`
    );
};

export const getLoanPaymentSchedule = async (
    loanId: string
) => {
    return api.get<LoanPaymentSchedule[]>(
        `/api/loans/${loanId}/schedule`
    );
};

export const createLoanPayment = async (
    loanId: string,
    cardId: string
) => {
    return api.post(
        `/api/loans/${loanId}/payments`,
        {
            cardId,
        }
    );
};

export const createEarlyLoanRepayment = async (
    loanId: string,
    cardId: string
) => {
    return api.post(
        `/api/loans/${loanId}/early-repayment`,
        {
            cardId,
        }
    );
};