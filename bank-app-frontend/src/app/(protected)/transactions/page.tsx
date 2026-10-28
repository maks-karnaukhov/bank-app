"use client";

import { useEffect, useMemo, useState } from "react";
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
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transactions | null>(null);

    useEffect(() => {
        void dispatch(fetchTransactionsThunk());
    }, [dispatch]);

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
                        <label className={styles.selectLabel}>
                            <span>Period</span>
                            <select
                                value={period}
                                onChange={(event) => handlePeriodChange(event.target.value as Period)}
                            >
                                <option value="this-month">This month</option>
                                <option value="last-month">Last month</option>
                                <option value="all-time">All time</option>
                                <option value="custom">Custom range</option>
                            </select>
                        </label>
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
                                    {selectedTransaction.type === "test_top_up"
                                        ? "Test Balance Top-Up" : "Transfer"}
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