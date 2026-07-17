import { api } from "@/services/api";

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
    return api.post("/auth/verify-otp", {
      email,
      code,
      purpose,
    });
  },
};