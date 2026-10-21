import { useEffect, useRef, useState } from "react";
import { authApi, type OtpPurpose } from "@/services/auth/authApi";
import type { User } from "@/types/types";
import axios from "axios";

type Status =
  | "ACTIVE"
  | "EXPIRED"
  | "BLOCKED"
  | "VERIFIED";

export function useOtpFlow(
  email: string,
  purpose: OtpPurpose,
  onSuccess: (user?: User) => void,
  currentPassword?: string
) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(3);
  const [secondsLeft, setSecondsLeft] = useState(90);
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

      if (purpose === "EMAIL_CHANGE") {
        const response = await authApi.confirmEmailChange({
          newEmail: email,
          code: fullCode,
        });

        setStatus("VERIFIED");
        onSuccess(response.data.user);
      } else {
        const response = await authApi.verifyOtp(email, fullCode, purpose);

        setStatus("VERIFIED");
        onSuccess(response.data.user);
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const statusCode = err.response?.status;
        const data = err.response?.data;

        setError(data?.message || "Invalid code");

        if (statusCode === 400) {
          setAttemptsLeft(data?.attemptsLeft ?? null);
        }

        if (statusCode === 403) {
          setStatus("BLOCKED");
        }

        if (statusCode === 410) {
          setStatus("EXPIRED");
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

      if (purpose === "EMAIL_CHANGE") {
        if (!currentPassword) {
          setError("Current password is required to resend the code.");
          return;
        }

        await authApi.requestEmailChange({
          newEmail: email,
          currentPassword,
        });
      } else {
        await authApi.requestOtp(email, purpose);
      }

      setCode(Array(6).fill(""));
      setSecondsLeft(90);
      setStatus("ACTIVE");

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 403) {
          setStatus("BLOCKED");
        } else if (status === 429) {
          setError("Too many requests. Try later.");
        } else {
          setError("Failed to resend code");
        }
      }
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
    if (value && next) {
      (next as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key !== "Backspace") return;

    event.preventDefault();

    const newCode = [...code];

    if (newCode[index]) {
      newCode[index] = "";
    } else if (index > 0) {
      newCode[index - 1] = "";
    }

    setCode(newCode);

    const previousIndex = newCode[index] === "" && index > 0
      ? index - 1
      : index;

    const input = document.getElementById(`otp-${previousIndex}`);

    if (input) {
      (input as HTMLInputElement).focus();
    }
  };

  return {
    code,
    handleChange,
    handleKeyDown,
    verify,
    resend,

    loading,
    error,

    attemptsLeft,
    secondsLeft,
    status,
  };
}