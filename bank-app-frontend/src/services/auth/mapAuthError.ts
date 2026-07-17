import { AuthErrorCode } from "./authErrors";

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

export function mapAuthError(error: unknown): AuthErrorCode {
  const err = error as ApiError;

  const status = err.response?.status;
  const message = err.response?.data?.message;

  if (status === 400 && message === "User already exists") {
    return AuthErrorCode.EMAIL_ALREADY_EXISTS;
  }
  if (status === 400 && message === "Phone already exists") {
    return AuthErrorCode.PHOHE_ALREADY_EXISTS;
  }
  if (status === 400 && message === "Email not verified") {
    return AuthErrorCode.EMAIL_NOT_VERIFIED;
  }

  if (status === 401) {
    return AuthErrorCode.INVALID_CREDENTIALS;
  }

  if (status === 403) {
    return AuthErrorCode.REGISTRATION_BLOCKED;
  }

  if (status === 404) {
    return AuthErrorCode.USER_NOT_FOUND;
  }

  return AuthErrorCode.SERVER_ERROR;
}