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

export const authApi = {
  register(data: RegisterDto) {
    return api.post("/auth/register", data);
  },

  login(data: LoginDto) {
    return api.post("/auth/login", data);
  },

  sendOtp(email: string) {
    return api.post("/auth/send-otp", { email });
  },

  resendOtp(email: string) {
    return api.post("/auth/resend-otp", { email });
  },

  verifyEmail(email: string, code: string) {
    return api.post("/auth/verify-email", { email, code });
  },
};