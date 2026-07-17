"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import type { RootState } from "@/store/store";
import LoginForm from "@/components/LoginForm/LoginForm";

import styles from "./LoginPage.module.css";
import Logo from "@/components/Logo/Logo";
import ForgotPasswordModal from "@/components/ForgotPasswordModal/ForgotPasswordModal";
import OTPModal from "@/components/OTPModal/OTPModal";

export default function LoginPage() {
  const [isForgotPasswordModal, setIsForgotPasswordModal] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [email, setEmail] = useState("");

  const router = useRouter();

  const { isAuthenticated, initialized } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (!initialized) return null;

  if (isAuthenticated) return null;

  return (
  <main className={styles.container}>
    <div className={styles.card}>
      <Logo />
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>
        Sign in to your account
      </p>
      <LoginForm onForgotPassword={() => setIsForgotPasswordModal(true)} />
    </div>
    {isForgotPasswordModal && 
      <ForgotPasswordModal 
        onCloseModal={() => setIsForgotPasswordModal(false)} 
        onOpenOTP={() => setOtpOpen(true)}
        onSaveEmail={(value: string) => setEmail(value)}
      />
    }
    {otpOpen && (
      <OTPModal
        email={email}
        purpose="PASSWORD_RESET"
        onSuccess={() => {
          setOtpOpen(false);
          // Открытие модального окна (это вы ?)
        }}
        onClose={() => setOtpOpen(false)}
      />
    )}
  </main>
  );
}