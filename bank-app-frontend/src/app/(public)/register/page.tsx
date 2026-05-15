"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import type { RootState } from "@/store/store";
import RegisterForm from "@/components/RegisterForm/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();

  const { isAuthenticated, initialized } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (!initialized) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h1>Register</h1>
      <RegisterForm />
    </div>
  );
}