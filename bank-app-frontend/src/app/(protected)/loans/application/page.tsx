"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
    createLoanApplication,
    LoanApplicationPurpose,
} from "@/services/loanApplicationApi";

import styles from "./LoanApplication.module.css";
import clsx from "clsx";

const LOAN_MIN = 100;
const LOAN_MAX = 50000;

const TERM_OPTIONS = [
    3,
    6,
    12,
    18,
    24,
];

const PURPOSE_OPTIONS = [
    {
        value: "PERSONAL",
        label: "Personal expenses",
    },
    {
        value: "HOME",
        label: "Home improvement",
    },
    {
        value: "EDUCATION",
        label: "Education",
    },
    {
        value: "CAR",
        label: "Car",
    },
    {
        value: "OTHER",
        label: "Other",
    },
];

export default function LoanApplicationPage() {
    const router = useRouter();

    const [amount, setAmount] = useState(5000);
    const [termMonths, setTermMonths] = useState(12);
    const [purpose, setPurpose] = useState("PERSONAL");
    const [isPurposeOpen, setIsPurposeOpen] = useState(false);
    const [isTermOpen, setIsTermOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAmountChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = Number(
            event.target.value
        );

        if (Number.isNaN(value)) {
            return;
        }

        setAmount(Math.min(Math.max(value, LOAN_MIN), LOAN_MAX));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            const response =
                await createLoanApplication({
                    amount,
                    termMonths,
                    purpose: purpose as LoanApplicationPurpose,
                });

            const application = response.data;

            router.push(`/loans/application/result?id=${application.id}`);
        } catch (error) {
            if (isAxiosError(error)) {
                setError(error.response?.data?.message || "Failed to submit loan application");
            } else {
                setError("Failed to submit loan application");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedPurpose = PURPOSE_OPTIONS.find((option) => option.value === purpose);

    return (
        <main className={styles.page}>
            <section className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Apply for a loan
                    </h1>

                    <p className={styles.subtitle}>
                        Tell us how much you need
                        and how you plan to repay it.
                        We&apos;ll review your
                        application and calculate
                        your available loan terms.
                    </p>
                </div>

                <div className={styles.content}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>
                                Loan details
                            </h2>

                            <p>
                                Choose the amount,
                                repayment period
                                and purpose of
                                your loan.
                            </p>
                        </div>

                        <div className={styles.field}>
                            <label
                                htmlFor="amount"
                                className={styles.label}
                            >
                                Loan amount
                            </label>

                            <div className={styles.inputWrapper}>
                                <span className={styles.currency}>
                                    $
                                </span>

                                <input
                                    id="amount"
                                    type="number"
                                    min={LOAN_MIN}
                                    max={LOAN_MAX}
                                    step="100"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.rangeInfo}>
                                <span>
                                    $100
                                </span>

                                <span>
                                    $50,000
                                </span>
                            </div>

                            <input
                                type="range"
                                min={LOAN_MIN}
                                max={LOAN_MAX}
                                step="100"
                                value={amount}
                                onChange={(event) => setAmount(Number(event.target.value))}
                                className={styles.range}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Loan term
                            </label>

                            <div className={styles.selectWrapper}>
                                <button
                                    type="button"
                                    className={clsx(styles.select, isTermOpen ? styles.selectOpen : "")}
                                    onClick={() => setIsTermOpen((prev) => !prev)}
                                    aria-expanded={isTermOpen}
                                >
                                    <span>
                                        {termMonths}{" "}
                                        months
                                    </span>

                                    <span className={styles.selectArrow} />
                                </button>

                                {isTermOpen && (
                                    <div className={styles.options}>
                                        {TERM_OPTIONS.map(
                                            (months) => (
                                                <button
                                                    key={months}
                                                    type="button"
                                                    className={clsx(styles.option, termMonths === months ? styles.optionActive : "")}
                                                    onClick={() => {
                                                        setTermMonths(months);
                                                        setIsTermOpen(false);
                                                    }}
                                                >
                                                    {months}{" "}
                                                    months
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Loan purpose
                            </label>

                            <div className={styles.selectWrapper}>
                                <button
                                    type="button"
                                    className={clsx(styles.select, isPurposeOpen ? styles.selectOpen : "")}
                                    onClick={() => setIsPurposeOpen((prev) => !prev)}
                                    aria-expanded={isPurposeOpen}
                                >
                                    <span>
                                        {selectedPurpose?.label}
                                    </span>

                                    <span className={styles.selectArrow} />
                                </button>

                                {isPurposeOpen && (
                                    <div className={styles.options}>
                                        {PURPOSE_OPTIONS.map(
                                            (option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={clsx(styles.option, purpose === option.value ? styles.optionActive : "")}
                                                    onClick={() => {
                                                        setPurpose(option.value);
                                                        setIsPurposeOpen(false );
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={clsx(styles.card, styles.infoCard)}>
                        <p className={styles.resultLabel}>
                            Your application
                        </p>

                        <h2 className={styles.infoTitle}>
                            Ready to apply?
                        </h2>

                        <p className={styles.infoText}>
                            We&apos;ll use the
                            information in your
                            Betta Bank profile to
                            review your application.
                        </p>

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>
                                    Requested amount
                                </span>

                                <strong>
                                    $
                                    {amount.toLocaleString("en-US")}
                                </strong>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>
                                    Repayment period
                                </span>

                                <strong>
                                    {termMonths}{" "}
                                    months
                                </strong>
                            </div>

                            <div className={styles.summaryRow}
                            >
                                <span>
                                    Purpose
                                </span>

                                <strong>
                                    {selectedPurpose?.label}
                                </strong>
                            </div>
                        </div>

                        {error && (
                            <p className={styles.error}>
                                {error}
                            </p>
                        )}

                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : "Submit application"}
                        </button>

                        <p className={styles.disclaimer}>
                            The final decision and
                            loan terms depend on the
                            results of the credit
                            assessment.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}