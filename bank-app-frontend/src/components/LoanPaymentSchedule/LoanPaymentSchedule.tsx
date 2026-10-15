"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";

import {
    getLoanPaymentSchedule,
    LoanPaymentSchedule as LoanPaymentScheduleType,
} from "@/services/loanApi";

import styles from "./LoanPaymentSchedule.module.css";
import clsx from "clsx";

type Props = {
    loanId: string;
};

export default function LoanPaymentSchedule({
    loanId,
}: Props) {
    const [schedule, setSchedule] = useState<LoanPaymentScheduleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getLoanPaymentSchedule(loanId);

                setSchedule(response.data);
            } catch (error) {
                if (isAxiosError(error)) {
                    setError(error.response?.data?.message || "Failed to load payment schedule");
                } else {
                    setError("Failed to load payment schedule");
                }
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, [loanId]);

    if (loading) {
        return (
            <section className={styles.section}>
                <p>Loading payment schedule...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.section}>
                <div className={styles.card}>
                    <h2>
                        Payment schedule
                    </h2>

                    <p className={styles.error}>
                        {error}
                    </p>
                </div>
            </section>
        );
    }

    if (schedule.length === 0) {
        return (
            <section className={styles.section}>
                <div className={styles.card}>
                    <h2>
                        Payment schedule
                    </h2>

                    <p>
                        No payment schedule available.
                    </p>
                </div>
            </section>
        );
    }

return (
    <section className={styles.section}>
        <div className={styles.card}>
            <div className={styles.header}>
                <div>

                    <h2 className={styles.title}>
                        Payment schedule
                    </h2>
                </div>

                <span className={styles.count}>
                    {schedule.length} payments
                </span>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Payment</th>
                            <th>Principal</th>
                            <th>Interest</th>
                            <th>Remaining</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {schedule.map(
                            (payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        {
                                            payment.installmentNumber
                                        }
                                    </td>

                                    <td>
                                        {new Date(payment.dueDate
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}
                                    </td>

                                    <td>
                                        $
                                        {payment.scheduledAmount.toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </td>

                                    <td>
                                        $
                                        {payment.principalAmount.toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </td>

                                    <td>
                                        $
                                        {payment.interestAmount.toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </td>

                                    <td>
                                        $
                                        {payment.remainingPrincipal.toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </td>

                                    <td>
                                        <span className={clsx(styles.status, styles[`status${payment.status}`])}>
                                            {
                                                payment.status
                                            }
                                        </span>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
);
}