"use client";

import styles from "./InfoModal.module.css";

interface IProps {
  title?: string;
  message: string;
  onClose: () => void;
}

export default function InfoModal({
  title = "Something went wrong",
  message,
  onClose,
}: IProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {message !== "Password has been changed successfully. Please sign in with your new password" && (
            <div className={styles.icon}>
                !
            </div>
        )}

        <h2 className={styles.title}>
          {title}
        </h2>

        <p className={styles.message}>
          {message}
        </p>

        <button
          className={styles.button}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}