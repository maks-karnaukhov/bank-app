"use client";

import styles from "./LoginForm.module.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUserThunk } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store/store";

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(
      loginUserThunk({ email, password })
    );

    if (loginUserThunk.fulfilled.match(result)) {
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
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? "Please wait..." : "Sign in"}
      </button>
      <button type="button" className={styles.linkA}>
        Forgot password?
      </button>
      <a
        className={styles.linkA}
        href="/register"
      >
        Create account
      </a>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}