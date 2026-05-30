"use client";

import styles from "./RegisterForm.module.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { registerUserThunk } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store/store";

interface IProp {
  onRegisterSuccess: (email: string) => void;
}

export default function RegisterForm({onRegisterSuccess}: IProp) {
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const isDisabled =
    loading ||
    !form.firstName ||
    !form.lastName ||
    !form.phone ||
    !form.email ||
    !form.password;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(registerUserThunk(form));

    if (registerUserThunk.fulfilled.match(result)) {
      onRegisterSuccess(form.email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        name="firstName"
        placeholder="First name"
        value={form.firstName}
        onChange={handleChange}
        autoComplete="given-name"
      />

      <input
        name="lastName"
        placeholder="Last name"
        value={form.lastName}
        onChange={handleChange}
        autoComplete="family-name"
      />

      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        autoComplete="tel"
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={isDisabled}
        className={styles.submitButton}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <a className={styles.linkA} href="/login">
        I already have an account
      </a>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}