import { api } from "@/services/api";
import { User } from "@/types/types";

export interface RegisterDto {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyOtpResponse {
  message: string;
  user?: User;
}

export type OtpPurpose =
  | "EMAIL_VERIFY"
  | "PASSWORD_RESET";

export const authApi = {
  register(data: RegisterDto) {
    return api.post("/auth/register", data);
  },

  login(data: LoginDto) {
    return api.post("/auth/login", data);
  },

  requestOtp(
    email: string,
    purpose: OtpPurpose
  ) {
    return api.post("/auth/request-otp", {
      email,
      purpose,
    });
  },

  verifyOtp(
    email: string,
    code: string,
    purpose: OtpPurpose
  ) {
    return api.post<VerifyOtpResponse>("/auth/verify-otp", {
      email,
      code,
      purpose,
    });
  },

  resetPassword(
    email: string,
    password: string
  ) {
      return api.post("/auth/reset-password", {
          email,
          password,
      });
  },
};