"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./OTPModal.module.css";
import { api } from "@/services/api";

interface IProps {
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function OTPModal({ email, onSuccess, onClose }: IProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerKey]);

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

          if (err.response?.status === 400) {
            setAttemptsLeft((prev) => Math.max(prev - 1, 0));
          }
        } else {
          setError("Something went wrong");
        }
      } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setSecondsLeft(60);
    setCode(["", "", "", "", "", ""]);
    setError("");
    setTimerKey((prev) => prev + 1);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Verify your email</h2>
        <p>We sent a verification code to {email}</p>

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

        {error && secondsLeft > 0 && <p className={styles.error}>{error}</p>}

        {secondsLeft > 0 ? (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
        ) : (
            <button
              type="button"
              onClick={handleResend}
              className={styles.resendButton}
            >
              Resend code
            </button>
        )}

        <button onClick={onClose} className={styles.close}>
          Cancel
        </button>
        {attemptsLeft > 0 && attemptsLeft < 3 && (<p className={styles.attempts}>
          Attempts left: {attemptsLeft}
        </p>
        )}
        {secondsLeft > 0 ? (
          <p className={styles.timer}>
            Code expires in {secondsLeft} sec
          </p>
        ) : (
            <p className={styles.error}>Code expired</p>
        )}
      </div>
    </div>
  );
}