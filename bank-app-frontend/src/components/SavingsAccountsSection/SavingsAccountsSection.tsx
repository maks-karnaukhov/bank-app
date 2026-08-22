"use client";

import { useEffect, useState } from "react";

import {
    fetchSavingsAccounts
} from "@/services/api";

import styles from "./SavingsAccountsSection.module.css";

import OpenSavingsAccountModal from "../OpenSavingsAccountModal/OpenSavingsAccountModal";
import CloseSavingsAccountModal from "../CloseSavingsAccountModal/CloseSavingsAccountModal";

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

export default function SavingsAccountsSection() {
    const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accountToClose, setAccountToClose] = useState<SavingsAccount | null>(null);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetchSavingsAccounts();

            setAccounts(response.data);
        } catch (error) {
            console.error(
                "Get savings accounts error:",
                error
            );

            setError("Failed to load savings accounts");
        } finally {
            setLoading(false);
        }
    };

    const handleAccountCreated = (
        newAccount: SavingsAccount
    ) => {
        setAccounts((currentAccounts) => [
            newAccount,
            ...currentAccounts,
        ]);

        setIsModalOpen(false);
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const calculateProgress = (
        balance: number,
        goalAmount: number
    ) => {
        if (goalAmount <= 0) {
            return 0;
        }

        return Math.min((balance / goalAmount) * 100, 100);
    };

    const formatAmount = (
        amount: number,
        currency: string
    ) => {
        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        ).format(amount);
    };

    if (loading) {
        return (
            <section className={styles.section}>
                <p>Loading savings accounts...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.section}>
                <div className={styles.card}>
                    <h2>Your savings</h2>

                    <p className={styles.error}>
                        {error}
                    </p>

                    <button
                        className={styles.secondaryButton}
                        onClick={loadAccounts}
                    >
                        Try again
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h2>Your savings</h2>

                    <p className={styles.description}>
                        Save money toward your goals
                        with interest.
                    </p>
                </div>

                <button
                    className={styles.primaryButton}
                    onClick={() => setIsModalOpen(true)}
                >
                    Open savings account
                </button>
            </div>

            {accounts.length === 0 ? (
                <div className={styles.emptyCard}>
                    <div>
                        <h3>
                            Start saving toward a goal
                        </h3>

                        <p>
                            Create a savings account,
                            set a goal and track your
                            progress over time.
                        </p>
                    </div>
                </div>
            ) : (
                <div className={styles.accounts}>
                    {accounts.map((account) => {
                        const progress =
                            calculateProgress(
                                account.balance,
                                account.goalAmount
                            );

                        return (
                            <div
                                key={account.id}
                                className={styles.accountCard}
                            >
                                <div
                                    className={
                                        styles.accountHeader
                                    }
                                >
                                    <div>
                                        <h3>
                                            {account.name}
                                        </h3>

                                        <p>
                                            {account.purpose}
                                        </p>
                                    </div>

                                    <span className={styles.interestRate}>
                                        {account.interestRate}%
                                        APY
                                    </span>
                                </div>

                                <div className={styles.balance}>
                                    <span>Balance</span>

                                    <strong>
                                        {formatAmount(account.balance, account.currency)}
                                    </strong>
                                </div>

                                <div className={styles.goal}>
                                    <div className={styles.goalHeader}>
                                        <span>Goal</span>

                                        <strong>
                                            {formatAmount(account.goalAmount, account.currency)}
                                        </strong>
                                    </div>

                                    <div className={styles.progressTrack}>
                                        <div 
                                            className={styles.progressBar}
                                            style={{
                                                width: `${progress}%`,
                                            }}
                                        />
                                    </div>

                                    <span className={styles.progressText}>
                                        {progress.toFixed(0)}%
                                        of goal
                                    </span>
                                </div>

                                <div className={styles.actions}>
                                    <button className={styles.secondaryButton}>
                                        Add money
                                    </button>

                                    <button className={styles.secondaryButton}>
                                        Withdraw
                                    </button>

                                        <button
                                            className={styles.dangerButton}
                                            onClick={() => setAccountToClose(account)}
                                        >
                                            Close account
                                        </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {isModalOpen && (
                <OpenSavingsAccountModal
                    onClose={() => setIsModalOpen(false)}
                    onCreated={handleAccountCreated}
                />
            )}
            {accountToClose && (
                <CloseSavingsAccountModal
                    account={accountToClose}
                    onClose={() => setAccountToClose(null)}
                    onClosed={() => {
                        setAccounts((currentAccounts) =>
                            currentAccounts.filter((item) => item.id !== accountToClose.id)
                        );

                        setAccountToClose(null);
                    }}
                />
            )}
        </section>
    );
}