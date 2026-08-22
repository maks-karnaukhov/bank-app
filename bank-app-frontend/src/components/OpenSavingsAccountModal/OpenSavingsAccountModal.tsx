"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import { createSavingsAccount } from "@/services/api";

import styles from "./OpenSavingsAccountModal.module.css";

type SavingsAccount = {
    id: string;
    name: string;
    purpose: string;
    goalAmount: number;
    balance: number;
    currency: string;
    interestRate: number;
    lastInterestAppliedAt: string;
    isClosed: boolean;
    createdAt: string;
};

type OpenSavingsAccountModalProps = {
    onClose: () => void;
    onCreated: (account: SavingsAccount) => void;
};

export default function OpenSavingsAccountModal({
    onClose,
    onCreated,
}: OpenSavingsAccountModalProps) {
    const [name, setName] = useState("");
    const [purpose, setPurpose] = useState("");
    const [goalAmount, setGoalAmount] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError(null);

        if (!name.trim()) {
            setError("Savings account name is required");
            return;
        }

        if (!purpose.trim()) {
            setError("Savings account purpose is required");
            return;
        }

        const parsedGoalAmount = Number(goalAmount);

        if (
            !goalAmount ||
            !Number.isFinite(parsedGoalAmount) ||
            parsedGoalAmount <= 0
        ) {
            setError("Goal amount must be greater than zero");
            return;
        }

        try {
            setLoading(true);

            const response = await createSavingsAccount({
                name: name.trim(),
                purpose: purpose.trim(),
                goalAmount: parsedGoalAmount,
            });

            onCreated(response.data);
        } catch (error) {
            if (isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                    "Failed to create savings account"
                );
            } else {
                setError("Failed to create savings account");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
        >
            <div
                className={styles.modal}
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.header}>
                    <div>
                        <h2>
                            Open savings account
                        </h2>

                        <p>
                            Set a name, purpose and
                            savings goal.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                >
                    <label>
                        Account name

                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="My vacation"
                            disabled={loading}
                        />
                    </label>

                    <label>
                        What are you saving for?

                        <input
                            type="text"
                            value={purpose}
                            onChange={(event) => setPurpose(event.target.value)}
                            placeholder="Saving for a trip"
                            disabled={loading}
                        />
                    </label>

                    <label>
                        Savings goal

                        <div className={styles.amountInput}>
                            <span>$</span>

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={goalAmount}
                                onChange={(event) => setGoalAmount(event.target.value)}
                                placeholder="5000"
                                disabled={loading}
                            />
                        </div>
                    </label>

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Open account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}