import { isAxiosError } from "axios";

import type {
  CurrentUser,
  FinancialProfile,
  FinancialProfileForm,
} from "./profile.types";

export const employmentLabels: Record<
  FinancialProfile["employmentType"],
  string
> = {
  EMPLOYED: "Employed",
  SELF_EMPLOYED: "Self-employed",
  ENTREPRENEUR: "Entrepreneur",
  UNEMPLOYED: "Unemployed",
  OTHER: "Other",
};

export const eventLabels: Record<string, string> = {
  PAYMENT_ON_TIME: "On-time payment",
  PAYMENT_LATE: "Late payment",
  LOAN_PAID: "Loan fully repaid",
  LOAN_DEFAULTED: "Loan defaulted",
};

export function formatDate(value?: string | null): string {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      "Unable to load this information."
    );
  }

  return "Unable to load this information.";
}

export function getInitials(user: CurrentUser): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";

  return `${first}${last}`.toUpperCase() || "U";
}

export function toDateInputValue(
  value?: string | null
): string {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function toFinancialProfileForm(
  profile: FinancialProfile
): FinancialProfileForm {
  return {
    dateOfBirth: toDateInputValue(profile.dateOfBirth),
    monthlyIncome: String(profile.monthlyIncome),
    monthlyExternalDebtPayments: String(profile.monthlyExternalDebtPayments),
    employmentType: profile.employmentType,
    employmentStartDate: toDateInputValue(profile.employmentStartDate)
  };
}