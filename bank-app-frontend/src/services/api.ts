import axios from "axios";

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

export const createTransaction = (
  data: {
    to: string;
    amount: number;
  }
) =>
  api.post("/transfer", data);

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