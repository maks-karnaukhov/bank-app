"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

import {
    getLoans,
    Loan,
} from "@/services/loanApi";

import styles from "./LoansSection.module.css";
import clsx from "clsx";

const STATUS_LABELS: Record<
    Loan["status"],
    string
> = {
    ACTIVE: "Active",
    PAID: "Paid",
    CLOSED: "Closed",
};

export default function LoansSection() {
    const router = useRouter();

    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLoans = async () => {
            try {
                const response = await getLoans();

                setLoans(response.data);
            } catch (error) {
                if (isAxiosError(error)) {
                    console.error(
                        "Failed to load loans:",
                        error.response?.data
                    );
                } else {
                    console.error(
                        "Failed to load loans:",
                        error
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        loadLoans();
    }, []);

    if (loading || loans.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>

                    <h2 className={styles.title}>
                        Your loans
                    </h2>
                </div>

                <button
                    type="button"
                    className={styles.viewAll}
                    onClick={() => router.push("/loans")}
                >
                    View all
                </button>
            </div>

            <div className={styles.list}>
                {loans.map((loan) => (
                    <button
                        key={loan.id}
                        type="button"
                        className={styles.card}
                        onClick={() => router.push(`/loans/${loan.id}`)}
                    >
                        <div className={styles.cardTop}>
                            <div>
                                <p className={styles.cardLabel}>
                                    Personal loan
                                </p>

                                <p className={styles.amount}>
                                    $
                                    {loan.amount.toLocaleString(
                                        "en-US"
                                    )}
                                </p>
                            </div>

                            <span className={clsx(styles.status, styles[`status${loan.status}`])}>
                                {STATUS_LABELS[loan.status]}
                            </span>
                        </div>

                        <div className={styles.details}>
                            <div className={styles.detail}>
                                <span>
                                    Interest rate
                                </span>

                                <strong>
                                    {loan.interestRate}%
                                </strong>
                            </div>

                            <div className={styles.detail}>
                                <span>
                                    Monthly payment
                                </span>

                                <strong>
                                    $
                                    {loan.monthlyPayment.toLocaleString(
                                        "en-US",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </strong>
                            </div>

                            <div className={styles.detail}>
                                <span>
                                    Remaining
                                </span>

                                <strong>
                                    $
                                    {loan.remainingPrincipal.toLocaleString(
                                        "en-US",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </strong>
                            </div>

                            <div className={styles.detail}>
                                <span>
                                    Term
                                </span>

                                <strong>
                                    {loan.termMonths} months
                                </strong>
                            </div>
                        </div>

                        <div className={styles.nextPayment}>
                            <div>
                                <span>
                                    Next payment
                                </span>

                                <strong>
                                    {loan.nextPaymentDate
                                        ? new Date(
                                            loan.nextPaymentDate
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )
                                        : "No upcoming payments"}
                                </strong>
                            </div>

                            <span className={styles.nextPaymentAmount}>
                                $
                                {loan.monthlyPayment.toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </span>
                        </div>

                        <div className={styles.cardFooter}>
                            <span>
                                View loan details
                            </span>

                            <span className={styles.arrow}>
                                →
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}