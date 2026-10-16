export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
}

export interface FinancialProfile {
  dateOfBirth: string;
  monthlyIncome: number;
  monthlyExternalDebtPayments: number;
  employmentType:
    | "EMPLOYED"
    | "SELF_EMPLOYED"
    | "ENTREPRENEUR"
    | "UNEMPLOYED"
    | "OTHER";
  employmentStartDate: string;
}

export type FinancialProfileForm = {
  dateOfBirth: string;
  monthlyIncome: string;
  monthlyExternalDebtPayments: string;
  employmentType: FinancialProfile["employmentType"];
  employmentStartDate: string;
};

export interface CreditRating {
  id: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditRatingEvent {
  id: string;
  loanId?: string | null;
  type: string;
  points: number;
  scoreBefore: number;
  scoreAfter: number;
  createdAt: string;
}