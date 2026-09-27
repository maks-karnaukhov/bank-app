"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./LoanCalculator.module.css";
import clsx from "clsx";

export default function LoanCalculatorPage() {
    const [amount, setAmount] = useState(5000);
    const [termMonths, setTermMonths] = useState(12);
    const [isTermOpen, setIsTermOpen] = useState(false);

    const router = useRouter();

    const interestRate = 9.5;
    const monthlyRate = interestRate / 100 / 12;

    const monthlyPayment =
        monthlyRate === 0
            ? amount / termMonths
            : amount *
              (
                  monthlyRate *
                  Math.pow(
                      1 + monthlyRate,
                      termMonths
                  )
              ) /
              (
                  Math.pow(
                      1 + monthlyRate,
                      termMonths
                  ) - 1
              );

    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - amount;

    const formatMoney = (value: number) => {
        return value.toLocaleString(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
            }
        );
    };

    const handleAmountChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = Number(
            event.target.value
        );

        setAmount(
            Math.min(
                Math.max(value, 100),
                50000
            )
        );
    };

    return (
        <main className={styles.page}>
            <section className={styles.container}>
                <div className={styles.header}>
                    <div>

                        <h1 className={styles.title}>
                            Loan calculator
                        </h1>

                        <p className={styles.subtitle}>
                            Calculate your monthly
                            payment and see the total
                            cost of your loan.
                        </p>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>
                                Loan details
                            </h2>

                            <p>
                                Adjust the amount and
                                repayment period.
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
                                    min="100"
                                    max="50000"
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
                                min="100"
                                max="50000"
                                step="100"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(Number(event.target.value))
                                }
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
                                        {termMonths} months
                                    </span>

                                    <span className={styles.selectArrow} />
                                </button>

                                {isTermOpen && (
                                    <div className={styles.options}>
                                        {[3, 6, 12, 18, 24].map(
                                            (months) => (
                                                <button
                                                    key={months}
                                                    type="button"
                                                    className={clsx(styles.option,
                                                            termMonths === months ? styles.optionActive : ""
                                                        )
                                                    }
                                                    onClick={() => {
                                                        setTermMonths(months);
                                                        setIsTermOpen(false);
                                                    }}
                                                >
                                                    {months} months
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.interest}>
                            <span>
                                Interest rate
                            </span>

                            <strong>
                                {interestRate}%
                            </strong>
                        </div>
                    </div>

                    <div className={clsx(styles.card, styles.resultCard)}>
                        <div className={styles.resultHeader}>
                            <p className={styles.resultLabel}>
                                Estimated monthly payment
                            </p>

                            <strong className={styles.monthlyPayment}>
                                {formatMoney(monthlyPayment)}
                            </strong>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>
                                    Loan amount
                                </span>

                                <strong>
                                    {formatMoney(amount)}
                                </strong>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>
                                    Total interest
                                </span>

                                <strong>
                                    {formatMoney(totalInterest)}
                                </strong>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>
                                    Total payment
                                </span>

                                <strong>
                                    {formatMoney(totalPayment)}
                                </strong>
                            </div>

                            <div className={clsx(styles.summaryRow, styles.totalRow)}>
                                <span>
                                    Repayment period
                                </span>

                                <strong>
                                    {termMonths} months
                                </strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => router.push("/loans/application")}
                        >
                            Apply for a loan
                        </button>
                    </div>
                </div>

                <div className={styles.disclaimer}
                >
                    <p>
                        The calculation is
                        preliminary. The final loan
                        terms may differ after your
                        application is reviewed.
                    </p>
                </div>
            </section>
        </main>
    );
}