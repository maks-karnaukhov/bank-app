"use client";

import OTPBlockedModal from "../OTPBlockedModal/OTPBlockedModal";
import { useOtpFlow } from "./useOtpFlow";
import styles from "./OTPModal.module.css";
import type { OtpPurpose } from "@/services/auth/authApi";

interface IProps {
  email: string;
  purpose: OtpPurpose;
  onSuccess: () => void;
  onClose: () => void;
}

export default function OTPModal({ email, purpose, onSuccess, onClose }: IProps) {
  const otp = useOtpFlow(email, purpose, onSuccess);

  if (otp.status === "BLOCKED") {
    return <OTPBlockedModal onClose={onClose} />;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.title}>
          We sent a verification code to {email}
        </p>

        <div className={styles.inputs}>
          {otp.code.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              value={digit}
              maxLength={1}
              onChange={(e) => otp.handleChange(e.target.value, i)}
            />
          ))}
        </div>

        {otp.error && otp.secondsLeft > 0 && <p className={styles.error}>{otp.error}</p>}
        {otp.status === "EXPIRED" && <p className={styles.error}>Code expired</p>}

        {otp.status === "ACTIVE" && (
          <button
            className={styles.button}
            onClick={otp.verify}
            disabled={otp.loading}
          >
            Verify
          </button>
        )}

        {otp.status === "EXPIRED" ? (
          <button className={styles.resendButton} onClick={otp.resend}>
            Resend code
          </button>
        ) : (
          <p className={styles.timer}>
            Expires in {otp.secondsLeft}s
          </p>
        )}

        <button className={styles.close} onClick={onClose}>
          Cancel
        </button>

        {otp.attemptsLeft !== null && otp.attemptsLeft < 3 && (<p className={styles.attempts}>
          Attempts left: {otp.attemptsLeft}
        </p>
        )}
      </div>
    </div>
  );
}