"use client";

import styles from "./RegisterForm.module.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { registerUserThunk } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store/store";

export default function RegisterForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isDisabled =
    loading || !email.trim() || !password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(
      registerUserThunk({ email, password })
    );

    if (registerUserThunk.fulfilled.match(result)) {
      router.replace("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      <button type="submit" disabled={isDisabled} className={styles.submitButton}>
        {loading ? "Creating account..." : "Create account"}
      </button>
      <a
        className={styles.linkA}
        href="/login"
      >
        I already have an account
      </a>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}