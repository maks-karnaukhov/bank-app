"use client";

import { jsPDF } from "jspdf";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store/store";
import { fetchTransactionsThunk } from "@/features/transactions/transactionsSlice";
import type { Transactions } from "@/types/types";

import styles from "./Transactions.module.css";
import clsx from "clsx";

type Period = "this-month" | "last-month" | "all-time" | "custom";

const formatMoney = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount);

const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);

const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);

const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getPeriodDates = (period: Period) => {
    const now = new Date();

    if (period === "this-month") {
        return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                23,
                59,
                59,
                999,
            ),
        };
    }

    if (period === "last-month") {
        return {
            start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            end: new Date(
                now.getFullYear(),
                now.getMonth(),
                0,
                23,
                59,
                59,
                999,
            ),
        };
    }

    return { start: null, end: null };
};

const getTransactionTitle = (transaction: Transactions) => {
    if (transaction.type === "test_top_up") {
        return "Test Balance Top-Up";
    }

    return transaction.direction === "outgoing"
        ? "Transfer sent"
        : "Transfer received";
};

export default function TransactionsPage() {
    const dispatch = useDispatch<AppDispatch>();

    const transactions = useSelector(
        (state: RootState) => state.transactions.transactions,
    );
    const loading = useSelector(
        (state: RootState) => state.transactions.loading,
    );
    const error = useSelector(
        (state: RootState) => state.transactions.error,
    );

    const [period, setPeriod] = useState<Period>("this-month");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState<Transactions | null>(null);
    const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
    const periodMenuRef = useRef<HTMLDivElement>(null);

    const periodOptions: { value: Period; label: string }[] = [
        { value: "this-month", label: "This month" },
        { value: "last-month", label: "Last month" },
        { value: "all-time", label: "All time" },
        { value: "custom", label: "Custom range" },
    ];

    const selectedPeriodLabel = periodOptions.find((option) => option.value === period)?.label ?? "This month";

    useEffect(() => {
        void dispatch(fetchTransactionsThunk());
    }, [dispatch]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (periodMenuRef.current && !periodMenuRef.current.contains(event.target as Node)) {
                setIsPeriodMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const filteredTransactions = useMemo(() => {
        let start: Date | null = null;
        let end: Date | null = null;

        if (period === "custom") {
            if (customStart) {
                start = new Date(`${customStart}T00:00:00`);
            }

            if (customEnd) {
                end = new Date(`${customEnd}T23:59:59.999`);
            }
        } else if (period !== "all-time") {
            const dates = getPeriodDates(period);
            start = dates.start;
            end = dates.end;
        }

        return transactions
            .filter((transaction) => {
                const transactionDate = new Date(transaction.date);

                if (Number.isNaN(transactionDate.getTime())) {
                    return false;
                }

                if (start && transactionDate < start) {
                    return false;
                }

                if (end && transactionDate > end) {
                    return false;
                }

                return true;
            })
            .sort(
                (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime(),
            );
    }, [transactions, period, customStart, customEnd]);

    const statistics = useMemo(() => {
        return filteredTransactions.reduce(
            (totals, transaction) => {
                if (transaction.type === "test_top_up") {
                    return totals;
                }

                if (transaction.direction === "incoming") {
                    totals.income += transaction.amount;
                } else {
                    totals.expenses += transaction.amount;
                }

                return totals;
            },
            { income: 0, expenses: 0 },
        );
    }, [filteredTransactions]);

    const groupedTransactions = useMemo(() => {
        return filteredTransactions.reduce<Record<string, Transactions[]>>(
            (groups, transaction) => {
                const key = toDateInputValue(new Date(transaction.date));

                if (!groups[key]) {
                    groups[key] = [];
                }

                groups[key].push(transaction);
                return groups;
            },
            {},
        );
    }, [filteredTransactions]);

    const groupedDates = Object.keys(groupedTransactions).sort(
        (a, b) => b.localeCompare(a),
    );

    const handlePeriodChange = (nextPeriod: Period) => {
        setPeriod(nextPeriod);

        if (nextPeriod === "custom") {
            const now = new Date();

            setCustomStart((current) => current || toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1)));
            setCustomEnd((current) => current || toDateInputValue(now));
        }
    };

    const handleDownloadReceipt = () => {
        if (!selectedTransaction) {
            return;
        }

        const transaction = selectedTransaction;
        const doc = new jsPDF({ unit: "mm", format: "a4" });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        const isTopUp = transaction.type === "test_top_up";
        const isIncoming = isTopUp || transaction.direction === "incoming";
        const transactionDate = new Date(transaction.date);

        const amount = `${isIncoming ? "+" : "-"}${formatMoney(
            transaction.amount,
            transaction.currency,
        )}`;

        const addDetail = (label: string, value: string) => {
            const labelX = margin;
            const valueX = margin + 48;
            const maxValueWidth = contentWidth - 48;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(label, labelX, y);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59);

            const lines = doc.splitTextToSize(value || "-", maxValueWidth);
            doc.text(lines, valueX, y);

            y += Math.max(9, lines.length * 5 + 3);

            doc.setDrawColor(226, 232, 240);
            doc.line(margin, y - 3, pageWidth - margin, y - 3);
        };

        let y = 0;

        // Header
        doc.setFillColor(22, 54, 95);
        doc.roundedRect(margin, 18, contentWidth, 32, 3, 3, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(19);
        doc.text("BETTA BANK", margin + 8, 31);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("TRANSACTION RECEIPT", margin + 8, 41);

        // Transaction amount
        y = 65;

        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Transaction amount", margin, y);

        y += 13;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(25);
        doc.setTextColor(
            isIncoming ? 22 : 220,
            isIncoming ? 163 : 83,
            isIncoming ? 106 : 83,
        );
        doc.text(amount, margin, y);

        y += 9;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(
            `${formatDate(transactionDate)} at ${formatTime(transactionDate)}`,
            margin,
            y,
        );

        y += 17;

        // Transaction details
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text("Transaction details", margin, y);

        y += 10;

        addDetail("Transaction ID", transaction.id);
        addDetail("Type", isTopUp ? "Test Balance Top-Up" : "Transfer");
        addDetail(
            "Direction",
            isTopUp ? "Test balance top-up" : isIncoming ? "Incoming" : "Outgoing",
        );
        addDetail("From", transaction.from || "-");
        addDetail("To", transaction.to || "-");

        if (transaction.fromCard) {
            addDetail("Sender card", transaction.fromCard);
        }

        if (transaction.toCard) {
            addDetail("Recipient card", transaction.toCard);
        }

        // Footer
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);

        const footerText = isTopUp
            ? "This document records a test balance top-up in the Betta Bank demo application. It is not proof of a real bank transfer."
            : "This document records a transaction in the Betta Bank demo application. It is not a bank-issued statement.";

        const footerLines = doc.splitTextToSize(footerText, contentWidth);
        doc.text(footerLines, margin, Math.min(y, 265));

        const safeId = transaction.id.replace(/[^a-zA-Z0-9_-]/g, "-");
        doc.save(`betta-bank-receipt-${safeId}.pdf`);
    };

    const handleModalKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
        if (event.key === "Escape") {
            setSelectedTransaction(null);
        }
    };

    return (
        <main className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.eyebrow}>YOUR MONEY, IN ONE PLACE</p>
                    <h1>Transactions</h1>
                    <p className={styles.subtitle}>
                        Track your transfers and review your financial activity.
                    </p>
                </div>
            </header>

            <section className={styles.statistics}>
                <article className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statIcon}>↙</span>
                        <span className={styles.statLabel}>Income</span>
                    </div>
                    <p className={`${styles.statAmount} ${styles.income}`}>
                        {formatMoney(statistics.income)}
                    </p>
                    <p className={styles.statHint}>
                        Incoming transfers for this period
                    </p>
                </article>

                <article className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statIcon}>↗</span>
                        <span className={styles.statLabel}>Expenses</span>
                    </div>
                    <p className={styles.statAmount}>
                        {formatMoney(statistics.expenses)}
                    </p>
                    <p className={styles.statHint}>
                        Outgoing transfers for this period
                    </p>
                </article>

                <article className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statIcon}>⇄</span>
                        <span className={styles.statLabel}>Net Flow</span>
                    </div>
                    <p
                        className={clsx(styles.statAmount, 
                            statistics.income - statistics.expenses >= 0 ? styles.income : styles.expense
                        )}
                    >
                        {formatMoney(statistics.income - statistics.expenses)}
                    </p>
                    <p className={styles.statHint}>
                        Income minus expenses
                    </p>
                </article>
            </section>

            <section className={styles.historyCard}>
                <div className={styles.historyHeader}>
                    <div>
                        <h2>Transaction History</h2>
                        <p className={styles.subtitle}>
                            {filteredTransactions.length}{" "}
                            {filteredTransactions.length === 1 ? "transaction" : "transactions"}
                        </p>
                    </div>

                    <div className={styles.periodControls}>
                        <div className={styles.selectLabel}>
                            <span>Period</span>

                            <div className={styles.periodSelect} ref={periodMenuRef}>
                                <button
                                    type="button"
                                    className={clsx(styles.periodTrigger, 
                                        isPeriodMenuOpen ? styles.periodTriggerOpen : ""
                                    )}
                                    aria-haspopup="listbox"
                                    aria-expanded={isPeriodMenuOpen}
                                    onClick={() => setIsPeriodMenuOpen((open) => !open)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Escape") {
                                            setIsPeriodMenuOpen(false);
                                        }

                                        if (event.key === "ArrowDown" && !isPeriodMenuOpen) {
                                            event.preventDefault();
                                            setIsPeriodMenuOpen(true);
                                        }
                                    }}
                                >
                                    <span>{selectedPeriodLabel}</span>

                                    <svg
                                        className={clsx(styles.periodChevron, 
                                            isPeriodMenuOpen ? styles.periodChevronOpen : ""
                                        )}
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="m7 10 5 5 5-5"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                {isPeriodMenuOpen && (
                                    <div
                                        className={styles.periodOptions}
                                        role="listbox"
                                        aria-label="Transaction period"
                                        onKeyDown={(event) => {
                                            if (event.key === "Escape") {
                                                setIsPeriodMenuOpen(false);
                                            }
                                        }}
                                    >
                                        {periodOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                role="option"
                                                aria-selected={period === option.value}
                                                className={clsx(styles.periodOption, 
                                                    period === option.value ? styles.periodOptionSelected : ""
                                                )}
                                                onClick={() => {
                                                    handlePeriodChange(option.value);
                                                    setIsPeriodMenuOpen(false);
                                                }}
                                            >
                                                <span>{option.label}</span>

                                                {period === option.value && (
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="m5 12 4 4L19 6"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {period === "custom" && (
                    <div className={styles.customRange}>
                        <label>
                            <span>From</span>
                            <input
                                type="date"
                                value={customStart}
                                max={customEnd || undefined}
                                onChange={(event) => setCustomStart(event.target.value)}
                            />
                        </label>

                        <label>
                            <span>To</span>
                            <input
                                type="date"
                                value={customEnd}
                                min={customStart || undefined}
                                onChange={(event) => setCustomEnd(event.target.value)}
                            />
                        </label>
                    </div>
                )}

                {error && (
                    <div className={styles.errorMessage} role="alert">
                        {error}
                    </div>
                )}

                {loading && transactions.length === 0 ? (
                    <div className={styles.stateMessage}>
                        Loading transactions...
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>↔</span>
                        <h3>No transactions found</h3>
                        <p>
                            Try another period or make a transfer to see it here.
                        </p>
                    </div>
                ) : (
                    <div className={styles.transactionGroups}>
                        {groupedDates.map((dateKey) => (
                            <section
                                className={styles.dateGroup}
                                key={dateKey}
                            >
                                <h3 className={styles.dateHeading}>
                                    {formatDate(new Date(`${dateKey}T12:00:00`))}
                                </h3>

                                <div className={styles.transactionList}>
                                    {groupedTransactions[dateKey].map(
                                        (transaction) => {
                                            const isTopUp = transaction.type === "test_top_up";
                                            const isOutgoing = transaction.direction === "outgoing" && !isTopUp;
                                            const transactionDate = new Date(transaction.date);

                                            return (
                                                <button
                                                    type="button"
                                                    key={transaction.id}
                                                    className={styles.transactionRow}
                                                    onClick={() => setSelectedTransaction(transaction)}
                                                >
                                                    <span
                                                        className={clsx(styles.transactionIcon, 
                                                            isTopUp
                                                                ? styles.topUpIcon
                                                                : isOutgoing
                                                                  ? styles.outgoingIcon : styles.incomingIcon
                                                        )}
                                                    >
                                                        {isTopUp ? "＋" : isOutgoing ? "↗" : "↙"}
                                                    </span>

                                                    <span className={styles.transactionInfo}>
                                                        <span className={styles.transactionTitle}>
                                                            {getTransactionTitle(transaction)}
                                                        </span>
                                                        <span className={styles.transactionDescription}>
                                                            {isTopUp
                                                                ? "Test balance"
                                                                : isOutgoing
                                                                  ? `To: ${transaction.to}` : `From: ${transaction.from}`
                                                            }
                                                        </span>
                                                        <span className={styles.transactionTime}>
                                                            {formatTime(transactionDate)}
                                                        </span>
                                                    </span>

                                                    <span
                                                        className={clsx(styles.transactionAmount, 
                                                            isTopUp || !isOutgoing
                                                                ? styles.income : styles.expense
                                                        )}
                                                    >
                                                        {isTopUp || !isOutgoing ? "+" : "−"}
                                                        {formatMoney(transaction.amount, transaction.currency)}
                                                    </span>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </section>

            {selectedTransaction && (
                <div
                    className={styles.modalOverlay}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedTransaction(null);
                        }
                    }}
                >
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="transaction-modal-title"
                        onKeyDown={handleModalKeyDown}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <p className={styles.eyebrow}>
                                    TRANSACTION DETAILS
                                </p>
                                <h2 id="transaction-modal-title">
                                    {getTransactionTitle(selectedTransaction)}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={() => setSelectedTransaction(null)}
                                aria-label="Close transaction details"
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalAmount}>
                            <span
                                className={
                                    selectedTransaction.type === "test_top_up" ||
                                    selectedTransaction.direction === "incoming" ? styles.income : styles.expense
                                }
                            >
                                {selectedTransaction.type === "test_top_up" || selectedTransaction.direction === "incoming" ? "+" : "−"}
                                {formatMoney(selectedTransaction.amount, selectedTransaction.currency)}
                            </span>
                            <p>
                                {formatDate(new Date(selectedTransaction.date))} at{" "}
                                {formatTime(new Date(selectedTransaction.date))}
                            </p>
                        </div>

                        <div className={styles.detailList}>
                            <div className={styles.detailRow}>
                                <span>Transaction ID</span>
                                <strong className={styles.transactionId}>
                                    {selectedTransaction.id}
                                </strong>
                            </div>

                            <div className={styles.detailRow}>
                                <span>Type</span>
                                <strong>
                                    {selectedTransaction.type === "test_top_up" ? "Test Balance Top-Up" : "Transfer"}
                                </strong>
                            </div>

                            <div className={styles.detailRow}>
                                <span>Direction</span>
                                <strong>
                                    {selectedTransaction.type === "test_top_up"
                                        ? "Balance top-up"
                                        : selectedTransaction.direction === "outgoing"
                                          ? "Outgoing" : "Incoming"}
                                </strong>
                            </div>

                            <div className={styles.detailRow}>
                                <span>From</span>
                                <strong>{selectedTransaction.from || "—"}</strong>
                            </div>

                            <div className={styles.detailRow}>
                                <span>To</span>
                                <strong>{selectedTransaction.to || "—"}</strong>
                            </div>

                            {selectedTransaction.fromCard && (
                                <div className={styles.detailRow}>
                                    <span>Sender card</span>
                                    <strong>{selectedTransaction.fromCard}</strong>
                                </div>
                            )}

                            {selectedTransaction.toCard && (
                                <div className={styles.detailRow}>
                                    <span>Recipient card</span>
                                    <strong>{selectedTransaction.toCard}</strong>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className={styles.downloadReceiptButton}
                            onClick={handleDownloadReceipt}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Download PDF receipt
                        </button>

                        <button
                            type="button"
                            className={styles.closeModalButton}
                            onClick={() => setSelectedTransaction(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}