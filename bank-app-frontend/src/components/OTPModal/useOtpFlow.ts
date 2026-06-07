import { useEffect, useState } from "react";
import { api } from "@/services/api";
import axios from "axios";

export function useOtpFlow(email: string, onSuccess: () => void) {
  const [status, setStatus] = useState<"ACTIVE" | "EXPIRED" | "BLOCKED" | "SUCCESS">("ACTIVE");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (status !== "ACTIVE") return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("EXPIRED");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerKey, status]);

  const verify = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) return;

    try {
      setLoading(true);
      setError(null);

      await api.post("/auth/verify-email", {
        email,
        code: fullCode,
      });

      setStatus("SUCCESS");
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid code");

        if (err.response?.status === 400) {
          setAttemptsLeft((prev) => {
            const next = Math.max(prev - 1, 0);
            if (next === 0) setStatus("BLOCKED");
            return next;
          });
        }
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = () => {
    setCode(Array(6).fill(""));
    setSecondsLeft(60);
    setError(null);
    setStatus("ACTIVE");
    setTimerKey((prev) => prev + 1);
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    const next = document.getElementById(`otp-${index + 1}`);
    if (value && next) (next as HTMLInputElement).focus();
  };

  return {
    status,
    code,
    setCode,
    loading,
    error,
    attemptsLeft,
    secondsLeft,
    verify,
    resend,
    handleChange
  };
}