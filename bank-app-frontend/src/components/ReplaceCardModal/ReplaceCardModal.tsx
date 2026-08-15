"use client";

import { useState } from "react";

import styles from "./ReplaceCardModal.module.css";

interface ReplaceCardModalProps {
    onConfirm: (password: string) => void;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
}

export default function ReplaceCardModal({
    onConfirm,
    onCancel,
    loading = false,
    error = null,
}: ReplaceCardModalProps) {
    const [password, setPassword] = useState("");

    const handleConfirm = () => {
        if (!password) {
            return;
        }

        onConfirm(password);
    };

    return (
        <div
            className={styles.overlay}
            onClick={onCancel}
        >
            <div
                className={styles.modal}
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className={styles.header}>
                    <h2>
                        Replace card details?
                    </h2>

                    <button
                        className={styles.close}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    <p className={styles.description}>
                        Your current card number, expiry
                        date and CVV will be replaced
                        with new details.
                    </p>

                    <p className={styles.warning}>
                        Your old card details will no
                        longer be valid. Your balance
                        and card history will remain
                        unchanged.
                    </p>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        placeholder="Account password"
                        className={styles.input}
                        disabled={loading}
                        autoFocus
                    />

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={
                            loading || !password
                        }
                    >
                        {loading
                            ? "Replacing..."
                            : "Replace details"}
                    </button>
                </div>
            </div>
        </div>
    );
}