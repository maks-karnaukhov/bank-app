"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import type { RootState } from "@/store/store";
import LoginForm from "@/components/LoginForm/LoginForm";

import styles from "./LoginPage.module.css";
import Logo from "@/components/Logo/Logo";

export default function LoginPage() {
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
      <LoginForm />
    </div>
  </main>
  );
}