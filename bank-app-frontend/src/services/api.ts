import axios from "axios";

export type RecipientMethod = "email" | "phone" | "card";
export type TransferType = "own" | "recipient";

export interface TransferRecipientCard {
  id: string;
  name: string;
  type: "DEBIT" | "CREDIT";
  currency: string;
  last4: string;
  color: string;
  network: "VISA" | "MASTERCARD" | "MIR" | "AMEX";
  isVirtual: boolean;
  createdAt: string;
}

export interface TransferRecipientLookup {
  found: boolean;
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  cards: TransferRecipientCard[];
  matchedCardId: string | null;
  message: string | null;
}

export interface CreateTransferData {
  fromCardId: string;
  amount: number;
  transferType: TransferType;
  recipientMethod?: RecipientMethod;
  recipientValue?: string;
  toCardId?: string;
  anyCard?: boolean;
  to?: string;
}

export const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

export const loginUser = (
  credentials: {
    email: string;
    password: string;
  }
) =>
  api.post("/auth/login", credentials);

export const registerUser = (data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}) => api.post("/auth/register", data);

export const fetchTransactions = () =>
  api.get("/transactions");

export const createTestTopUp = () =>
  api.post<{
    success: boolean;
    amount: number;
    currency: string;
    totalBalanceBefore: number;
    totalBalanceAfter: number;
    retryAt: string;
  }>("/transactions/test-top-up");

export const lookupTransferRecipient = (params: {
  method: RecipientMethod;
  value: string;
  fromCardId: string;
}) =>
  api.get<TransferRecipientLookup>("/transfer/recipient", {
    params,
  });

export const createTransaction = (data: CreateTransferData) =>
  api.post<{
    success: boolean;
    transaction: {
      id: string;
      from: string;
      to: string;
      amount: number;
      currency: string;
      date: string;
      direction: "outgoing";
    };
  }>("/transfer", data);

export const forgotPassword = (email: string) => 
  api.post("/auth/forgot-password", { email });

export const resetPassword = (
    email: string,
    password: string
) =>
    api.post("/auth/reset-password", {
        email,
        password,
    });

export const fetchSavingsAccounts = () =>
    api.get("/api/savings-accounts");

export const createSavingsAccount = (
    data: {
        name: string;
        purpose: string;
        goalAmount: number;
    }
) =>
    api.post(
        "/api/savings-accounts",
        data
    );

export const closeSavingsAccount = (
    accountId: string
) =>
    api.delete(
        `/api/savings-accounts/${accountId}`
    );


export const fetchCurrentUser = () =>
  api.get("/auth/me");

export const updateCurrentUser = (data: {
  firstName: string;
  lastName: string;
  phone: string;
}) => api.patch("/auth/me", data);

export const uploadCurrentUserAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return api.post<{
    message: string;
    avatarUrl: string;
  }>("/auth/avatar", formData);
};

export const fetchCustomerFinancialProfile = () =>
  api.get("/api/customer-financial-profile");

export const fetchCurrentCreditRating = () =>
  api.get("/api/credit-rating");

export const fetchCreditRatingEvents = () =>
  api.get("/api/credit-rating/events");

export const createCustomerFinancialProfile = (data: {
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
}) => api.post("/api/customer-financial-profile", data);

export const updateCustomerFinancialProfile = (data: {
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
}) => api.patch("/api/customer-financial-profile", data);

export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) =>
  api.post("/auth/change-password", data);

export const requestEmailChange = (data: {
  newEmail: string;
  currentPassword: string;
}) =>
  api.post("/auth/request-email-change", data);

export const confirmEmailChange = (data: {
  newEmail: string;
  code: string;
}) =>
  api.post("/auth/confirm-email-change", data);