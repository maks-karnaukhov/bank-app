"use client";

import styles from "./OTPBlockedModal.module.css";

interface Props {
  onClose: () => void;
}

export default function OTPBlockedModal({ onClose }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Too many attempts</h2>

        <p className={styles.text}>
          You have used all verification attempts.
          Please try again after 24 hours.
        </p>

        <button className={styles.close} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}