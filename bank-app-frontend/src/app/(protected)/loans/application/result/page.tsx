"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

import {
    getLoanApplication,
    GetLoanApplicationResponse,
} from "@/services/loanApplicationApi";

import styles from "./LoanApplicationResult.module.css";

const PURPOSE_LABELS: Record<string, string> = {
    PERSONAL: "Personal expenses",
    HOME: "Home improvement",
    EDUCATION: "Education",
    CAR: "Car",
    OTHER: "Other",
};

export default function LoanApplicationResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [application, setApplication] = useState<GetLoanApplicationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get("id");

        if (!id) {
            setError("Loan application ID is missing");
            setLoading(false);
            return;
        }

        const loadApplication = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getLoanApplication(id);

                setApplication(response.data);
            } catch (error) {
                if (isAxiosError(error)) {
                    setError(error.response?.data?.message || "Failed to load loan application");
                } else {
                    setError("Failed to load loan application");
                }
            } finally {
                setLoading(false);
            }
        };

        loadApplication();
    }, [searchParams]);

    if (loading) {
        return (
            <main className={styles.page}>
                <section className={styles.container}>
                    <div className={styles.loadingCard}>
                        <div className={styles.spinner} />

                        <h1 className={styles.loadingTitle}>
                            Checking your application
                        </h1>

                        <p className={styles.loadingText}>
                            We&apos;re retrieving
                            the latest information
                            about your loan
                            application.
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (error) {
        return (
            <main className={styles.page}>
                <section className={styles.container}>
                    <div className={styles.resultCard}>
                        <div className={styles.iconError}>
                            !
                        </div>

                        <p className={styles.eyebrow}>
                            Loan application
                        </p>

                        <h1 className={styles.title}>
                            Something went wrong
                        </h1>

                        <p className={styles.description}>
                            {error}
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (!application) {
        return null;
    }

    const purposeLabel = PURPOSE_LABELS[application.purpose] ?? application.purpose;

    if (application.status === "APPROVED") {
        return (
            <main className={styles.page}>
                <section className={styles.container}>
                    <div className={styles.resultCard}>
                        <div className={styles.iconApproved}>
                            ✓
                        </div>

                        <p className={styles.eyebrow}>
                            Loan application
                        </p>

                        <h1 className={styles.title}>
                            Loan approved
                        </h1>

                        <p className={styles.description}>
                            Your loan application
                            has been approved.
                        </p>

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>
                                    Requested amount
                                </span>

                                <strong>
                                    $
                                    {application.amount.toLocaleString("en-US")}
                                </strong>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>
                                    Repayment period
                                </span>

                                <strong>
                                    {application.termMonths}{" "}
                                    months
                                </strong>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>
                                    Purpose
                                </span>

                                <strong>
                                    {purposeLabel}
                                </strong>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() =>
                                router.push("/loans/calculator")
                            }
                        >
                            Back to loan calculator
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    if (application.status === "REJECTED") {
        return (
            <main className={styles.page}>
                <section className={styles.container}>
                    <div className={styles.resultCard}>
                        <div className={styles.iconRejected}>
                            ×
                        </div>

                        <p className={styles.eyebrow}>
                            Loan application
                        </p>

                        <h1 className={styles.title}
                        >
                            Application declined
                        </h1>

                        <p className={styles.description}>
                            We were unable to
                            approve your loan
                            application at this
                            time.
                        </p>

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>
                                    Requested amount
                                </span>

                                <strong>
                                    $
                                    {application.amount.toLocaleString("en-US")}
                                </strong>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>
                                    Repayment period
                                </span>

                                <strong>
                                    {application.termMonths}{" "}months
                                </strong>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>
                                    Reason
                                </span>

                                <strong>
                                    {application.decisionReason}
                                </strong>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() =>
                                router.push("/loans/calculator")
                            }
                        >
                            Back to loan calculator
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <section className={styles.container}>
                <div className={styles.resultCard}
                >
                    <div className={styles.iconPending}>
                        …
                    </div>

                    <p className={styles.eyebrow}>
                        Loan application
                    </p>

                    <h1 className={styles.title}>
                        Application under review
                    </h1>

                    <p className={styles.description}>
                        Your application has been
                        submitted successfully.
                        Our credit team is reviewing
                        your application.
                    </p>

                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span>
                                Requested amount
                            </span>

                            <strong>
                                $
                                {application.amount.toLocaleString("en-US")}
                            </strong>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>
                                Repayment period
                            </span>

                            <strong>
                                {application.termMonths}{" "}
                                months
                            </strong>
                        </div>

                        <div
                            className={styles.summaryRow}
                        >
                            <span>
                                Purpose
                            </span>

                            <strong>
                                {purposeLabel}
                            </strong>
                        </div>

                        <div className={styles.summaryRow}
                        >
                            <span>
                                Credit score
                            </span>

                            <strong>
                                {application.creditScore}
                            </strong>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() =>
                            router.push("/loans/calculator")
                        }
                    >
                        Back to loan calculator
                    </button>

                    <p className={styles.reviewNote}>
                        {application.decisionReason}
                    </p>
                </div>
            </section>
        </main>
    );
}