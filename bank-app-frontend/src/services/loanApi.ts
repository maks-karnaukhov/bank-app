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

export type LoanAutoPayment = {
    id: string;
    loanId: string;
    cardId: string;
    isEnabled: boolean;
    lastAttemptAt: string | null;
    lastSuccessfulPaymentAt: string | null;
    lastError: string | null;
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

export const enableLoanAutoPayment = async (
    loanId: string,
    cardId: string
) => {
    return api.post<LoanAutoPayment>(
        `/api/loans/${loanId}/auto-payment`,
        { cardId }
    );
};

export const disableLoanAutoPayment = async (
    loanId: string
) => {
    return api.delete<LoanAutoPayment>(
        `/api/loans/${loanId}/auto-payment`
    );
};

export const getLoanAutoPayment = async (
    loanId: string
) => {
    return api.get<{
        autoPayment: LoanAutoPayment | null;
    }>(`/api/loans/${loanId}/auto-payment`);
};

export const executeLoanAutoPayment = async (
    loanId: string
) => {
    return api.post(
        `/api/loans/${loanId}/auto-payment/execute`
    );
};