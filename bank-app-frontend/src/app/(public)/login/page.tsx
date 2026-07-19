"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import type { RootState } from "@/store/store";
import LoginForm from "@/components/LoginForm/LoginForm";

import styles from "./LoginPage.module.css";
import Logo from "@/components/Logo/Logo";
import ForgotPasswordModal from "@/components/ForgotPasswordModal/ForgotPasswordModal";
import ConfirmUserModal from "@/components/ConfirmUserModal/ConfirmUserModal";
import OTPModal from "@/components/OTPModal/OTPModal";
import InfoModal from "@/components/InfoModal/InfoModal";
import { useRetryTime } from "@/hooks/useRetryTime";
import type { User } from "@/types/types";

export default function LoginPage() {
  const [retryAt, setRetryAt] = useState<string>();
  const [selectedUser, setSelectedUser] =
  useState<User | null>(null);
  const [modal, setModal] = useState<
    "forgot" | "otp" | "info" | "confirm-user" | null
  >(null);
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState({
    title: "",
    message: "",
  });

  const router = useRouter();
  const timeLeft = useRetryTime(retryAt);

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
      <LoginForm onForgotPassword={() => setModal("forgot")} />
    </div>
    {modal === "forgot" && (
      <ForgotPasswordModal
        onCloseModal={() => setModal(null)}
        onOpenOTP={() => setModal("otp")}
        onSaveEmail={(value: string) => setEmail(value)}
        onError={(message) => {
          setInfo((prev) => ({
            ...prev,
            message,
          }));

          setModal("info");
        }}
        onTitle={(title) => {
          setInfo((prev) => ({
            ...prev,
            title,
          }));
        }}
        onRetryAt={(value: string) => setRetryAt(value)}
      />
    )}
    {modal === "otp" && (
      <OTPModal
        email={email}
        purpose="PASSWORD_RESET"
        onSuccess={(user) => {
          console.log(user);

          setSelectedUser(user ?? null)
          setModal("confirm-user");
        }}
        onClose={() => setModal(null)}
      />
    )}
    {modal === "info" && (
      <InfoModal
        title={info.title}
        message={
          info.title === "Password reset has been temporarily blocked" && timeLeft
            ? `Please try again in ${timeLeft.formatted}`
            : info.message
        }
        onClose={() => setModal(null)}
      />
    )}
    {modal === "confirm-user" && selectedUser && (
    <ConfirmUserModal
        user={selectedUser}
        onConfirm={() => {
            // следующий шаг: ввод нового пароля
        }}
        onClose={() => {
            setSelectedUser(null);
            setModal(null);
        }}
    />
)}
  </main>
  );
}