"use client";

import axios from "axios";
import { useState } from "react";
import styles from "./OTPModal.module.css";
import { api } from "@/services/api";

interface Props {
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function OTPModal({ email, onSuccess, onClose }: Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    const next = document.getElementById(`otp-${index + 1}`);
    if (value && next) (next as HTMLInputElement).focus();
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) return;

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/verify-email", {
        email,
        code: fullCode,
      });

      onSuccess();
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || "Invalid code");
        } else {
            setError("Something went wrong");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Verify your email</h2>
        <p>We sent a 6-digit code to {email}</p>

        <div className={styles.inputs}>
          {code.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              value={digit}
              maxLength={1}
              onChange={(e) => handleChange(e.target.value, i)}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button onClick={onClose} className={styles.close}>
          Cancel
        </button>
      </div>
    </div>
  );
}