import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { AuthErrorCode } from "@/services/auth/authErrors";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  EMAIL_ALREADY_EXISTS: "An account with this email already exists",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  WEAK_PASSWORD: "Password is too weak",
  INVALID_EMAIL: "Invalid email format",
  SERVER_ERROR: "Something went wrong. Please try again later",
};

const isAuthErrorCode = (value: unknown): value is AuthErrorCode => {
  return typeof value === "string" && value in ERROR_MESSAGES;
};

export function useAuthError() {
  const error = useSelector((state: RootState) => state.auth.error);

  if (!error) return null;

  if (isAuthErrorCode(error)) {
    return ERROR_MESSAGES[error];
  }

  return ERROR_MESSAGES.SERVER_ERROR;
}