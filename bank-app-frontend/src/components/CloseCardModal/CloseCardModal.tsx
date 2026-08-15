"use client";

import styles from "./CloseCardModal.module.css";

interface CloseCardModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function CloseCardModal({
    onConfirm,
    onCancel,
    loading = false,
}: CloseCardModalProps) {
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
                        Close card?
                    </h2>

                    <button
                        className={styles.close}
                        onClick={onCancel}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    <p>
                        Are you sure you want to close
                        this card?
                    </p>

                    <p className={styles.warning}>
                        This action cannot be undone.
                        You will need to order a new
                        card if you want another
                        physical card.
                    </p>
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
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading
                            ? "Closing..."
                            : "Close card"}
                    </button>
                </div>
            </div>
        </div>
    );
}