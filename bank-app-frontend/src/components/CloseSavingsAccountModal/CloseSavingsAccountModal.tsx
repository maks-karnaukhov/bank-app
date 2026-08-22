"use client";

import { useState } from "react";
import { AxiosError } from "axios";

import { closeSavingsAccount } from "@/services/api";

import styles from "./CloseSavingsAccountModal.module.css";

type SavingsAccount = {
    id: string;
    name: string;
    balance: number;
    currency: string;
};

type CloseSavingsAccountModalProps = {
    account: SavingsAccount;
    onClose: () => void;
    onClosed: () => void;
};

export default function CloseSavingsAccountModal({
    account,
    onClose,
    onClosed,
}: CloseSavingsAccountModalProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCloseAccount = async () => {
        try {
            setIsClosing(true);
            setError(null);

            await closeSavingsAccount(account.id);

            onClosed();
        } catch (error) {
            console.error(
                "Close savings account error:",
                error
            );

            if (error instanceof AxiosError) {
                setError(
                    error.response?.data?.message ||
                    "Failed to close savings account"
                );
            } else {
                setError("Failed to close savings account");
            }
        } finally {
            setIsClosing(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {error ? (
                    <>
                        <h2>
                            Unable to close account
                        </h2>

                        <p className={styles.error}>
                            {error}
                        </p>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={onClose}
                            >
                                OK
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>
                            Close savings account?
                        </h2>

                        <p>
                            Are you sure you want to
                            close{" "}
                            <strong>
                                {account.name}
                            </strong>
                            ?
                        </p>

                        {account.balance > 0 && (
                            <p className={styles.warning}>
                                This account still has a
                                balance of{" "}
                                <strong>
                                    {account.currency}{" "}
                                    {account.balance.toFixed(2)}
                                </strong>
                                . You must withdraw all
                                funds before closing the
                                account.
                            </p>
                        )}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={onClose}
                                disabled={isClosing}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={handleCloseAccount}
                                disabled={isClosing}
                            >
                                {isClosing
                                    ? "Closing..."
                                    : "Close account"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}