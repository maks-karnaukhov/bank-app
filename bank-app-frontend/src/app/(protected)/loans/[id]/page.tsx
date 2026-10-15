"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";

import {
    getLoanById,
    type Loan,
} from "@/services/loanApi";

import styles from "./LoanDetails.module.css";
import clsx from "clsx";

import LoanPaymentSchedule from "@/components/LoanPaymentSchedule/LoanPaymentSchedule";
import LoanPaymentModal from "@/components/LoanPaymentModal/LoanPaymentModal";

export default function LoanDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const loanId = params.id as string;

    const [loan, setLoan] = useState<Loan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [scheduleVersion, setScheduleVersion] = useState(0);

    useEffect(() => {
        const loadLoan = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getLoanById(loanId);

                setLoan(response.data);
            } catch (error) {
                if (isAxiosError(error)) {
                    setError(error.response?.data?.message || "Failed to load loan");
                } else {
                    setError("Failed to load loan");
                }
            } finally {
                setLoading(false);
            }
        };

        loadLoan();
    }, [loanId]);

    if (loading) {
        return (
            <main className={styles.container}>
                <p>Loading loan...</p>
            </main>
        );
    }

    if (error || !loan) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <h1>
                        Loan
                    </h1>

                    <p className={styles.error}>
                        {error || "Loan not found"}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                    >
                        Back to dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <button
                type="button"
                className={styles.backButton}
                onClick={() => router.push("/dashboard")}
            >
                ← Back to dashboard
            </button>

            <div className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>
                            Personal loan
                        </p>

                        <h1 className={styles.title}>
                            Loan details
                        </h1>
                    </div>

                    <span className={clsx(styles.status, styles[`status${loan.status}`])}>
                        {loan.status}
                    </span>
                </div>

                <div className={styles.mainAmount}>
                    <span>
                        Loan amount
                    </span>

                    <strong>
                        $
                        {loan.amount.toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}
                    </strong>
                </div>

                <div className={styles.details}>
                    <div className={styles.detail}>
                        <span>
                            Remaining principal
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
                            Interest rate
                        </span>

                        <strong>
                            {loan.interestRate}%
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

                    <div className={styles.detail}>
                        <span>
                            Total payment
                        </span>

                        <strong>
                            $
                            {loan.totalPayment.toLocaleString(
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
                            Total interest
                        </span>

                        <strong>
                            $
                            {loan.totalInterest.toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                    <div className={styles.nextPayment}>
                        <div>
                            <span className={styles.nextPaymentLabel}>
                                Next payment
                            </span>

                            <strong className={styles.nextPaymentDate}>
                                {loan.nextPaymentDate
                                    ? new Date(
                                        loan.nextPaymentDate
                                    ).toLocaleDateString(
                                        "en-US",
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )
                                    : "No upcoming payments"}
                            </strong>
                        </div>

                        {loan.nextPaymentDate && (
                            <strong className={styles.nextPaymentAmount}>
                                $
                                {loan.monthlyPayment.toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </strong>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => setIsPaymentModalOpen(true)}
                            disabled={loan.status !== "ACTIVE"}
                        >
                            Make a payment
                        </button>
                    </div>
                </div>
                <LoanPaymentSchedule
                    key={scheduleVersion}
                    loanId={loan.id}
                />
            </div>
            {isPaymentModalOpen && (
                <LoanPaymentModal
                    loanId={loan.id}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={(updatedLoan) => {
                        setLoan(updatedLoan);
                        setScheduleVersion((prev) => prev + 1);
                        setIsPaymentModalOpen(false);
                    }}
                />
            )}
        </main>
    );
}