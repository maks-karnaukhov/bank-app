import { useEffect, useRef, useState } from "react";
import { authApi } from "@/services/auth/authApi";
import axios from "axios";

type Status =
  | "ACTIVE"
  | "EXPIRED"
  | "BLOCKED";

export function useOtpFlow(email: string, onSuccess: () => void) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [status, setStatus] = useState<Status>("ACTIVE");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status !== "ACTIVE") return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStatus("EXPIRED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const verify = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) return;

    try {
      setLoading(true);
      setError("");

      await authApi.verifyEmail(email, fullCode);

      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const statusCode = err.response?.status;

        setError(err.response?.data?.message || "Invalid code");

        if (statusCode === 400) {
          setAttemptsLeft((prev) => {
            const next = prev - 1;

            if (next <= 0) {
              setStatus("BLOCKED");
            }

            return Math.max(next, 0);
          });
        }
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      setLoading(true);
      setError("");

      await authApi.resendOtp(email);

      setCode(Array(6).fill(""));
      setSecondsLeft(60);
      setStatus("ACTIVE");
    } catch (err) {
      setError("Failed to resend code");
    } finally {
      setLoading(false);
    }
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
    code,
    setCode,
    handleChange,

    verify,
    resend,

    loading,
    error,

    attemptsLeft,
    secondsLeft,
    status,
  };
}