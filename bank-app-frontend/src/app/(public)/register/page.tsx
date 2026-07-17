"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import type { RootState } from "@/store/store";
import RegisterForm from "@/components/RegisterForm/RegisterForm";
import OTPModal from "@/components/OTPModal/OTPModal";

import styles from "./RegisterPage.module.css";
import Logo from "@/components/Logo/Logo";
import EmailVerifiedModal from "@/components/EmailVerifiedModal/EmailVerifiedModal";

export default function RegisterPage() {
  const [otpOpen, setOtpOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
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

        <h1 className={styles.title}>Create account</h1>

        <p className={styles.subtitle}>
          Start using your banking dashboard
        </p>

        <RegisterForm
          onRegisterSuccess={(email) => {
            setEmail(email);
            setOtpOpen(true);
          }}
        />
        {otpOpen && (
          <OTPModal
            email={email}
            purpose="EMAIL_VERIFY"
            onSuccess={() => {
              setOtpOpen(false);
              setIsEmailVerified(true);
            }}
            onClose={() => setOtpOpen(false)}
          />
        )}
        {isEmailVerified && (
          <EmailVerifiedModal />
        )}
      </div>
    </main>
  );
}