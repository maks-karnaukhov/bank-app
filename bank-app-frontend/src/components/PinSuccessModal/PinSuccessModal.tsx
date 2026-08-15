"use client";

import styles from "./PinSuccessModal.module.css";

interface PinSuccessModalProps {
    onClose: () => void;
}

export default function PinSuccessModal({
    onClose,
}: PinSuccessModalProps) {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.icon}>
                    ✓
                </div>

                <h2>
                    PIN code set successfully
                </h2>

                <p>
                    Your PIN code has been
                    successfully set for this
                    card.
                </p>

                <button
                    className={styles.button}
                    onClick={onClose}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}