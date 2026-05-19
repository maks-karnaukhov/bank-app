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

export const registerUser = (
  credentials: {
    email: string;
    password: string;
  }
) =>
  api.post("/auth/register", credentials);

export const fetchTransactions = () =>
  api.get("/transactions");

export const createTransaction = (
  data: {
    to: string;
    amount: number;
  }
) =>
  api.post("/transfer", data);