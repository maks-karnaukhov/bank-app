import { api } from "./api";

export type LoanApplicationPurpose =
    | "PERSONAL"
    | "HOME"
    | "EDUCATION"
    | "CAR"
    | "OTHER";

export type CreateLoanApplicationRequest = {
    amount: number;
    termMonths: number;
    purpose: LoanApplicationPurpose;
};

export type LoanApplicationStatus =
    | "APPROVED"
    | "REJECTED"
    | "PENDING";

export type CreateLoanApplicationResponse = {
    id: string;
    amount: number;
    termMonths: number;
    purpose: LoanApplicationPurpose;
    status: LoanApplicationStatus;
    score?: number;
    interestRate?: number;
    monthlyPayment?: number;
    totalPayment?: number;
    totalInterest?: number;
    createdAt: string;
};

export type GetLoanApplicationResponse = {
    id: string;
    amount: number;
    termMonths: number;
    purpose: LoanApplicationPurpose;
    creditScore: number;
    decision:
        | "AUTO_APPROVED"
        | "AUTO_REJECTED"
        | "MANUAL_REVIEW";
    decisionReason: string;
    status: LoanApplicationStatus;
    createdAt: string;
};

export const createLoanApplication = async (
    data: CreateLoanApplicationRequest
) => {
    return api.post<CreateLoanApplicationResponse>(
        "/api/loan-applications",
        data
    );
};

export const getLoanApplication = async (
    id: string
) => {
    return api.get<GetLoanApplicationResponse>(
        `/api/loan-applications/${id}`
    );
};