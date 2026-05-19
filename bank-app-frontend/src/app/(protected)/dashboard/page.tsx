"use client";

import styles from "./Dashboard.module.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchTransactionsThunk,
} from "@/features/transactions/transactionsSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";


export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    transactions,
    loading,
    error,
  } = useSelector(
    (state: RootState) => state.transactions
  );

  useEffect(() => {
    dispatch(fetchTransactionsThunk());
  }, [dispatch]);
  return (
    <main className={styles.container}>
      <section className={styles.top}>
        <div>
          <h1 className={styles.title}>
            Welcome back 👋
          </h1>

          <p className={styles.subtitle}>
            Here’s what’s happening with your finances today.
          </p>
        </div>
      </section>

      <section className={styles.balanceCard}>
        <div>
          <p className={styles.balanceLabel}>
            Total Balance
          </p>

          <h2 className={styles.balance}>
            $12,480.00
          </h2>
        </div>

        <div className={styles.balanceGrowth}>
          +2.5% this month
        </div>
      </section>

      <section className={styles.actions}>
        <button className={styles.actionButton}>
          Transfer Money
        </button>

        <button className={styles.actionButton}>
          Transactions
        </button>

        <button className={styles.actionButton}>
          My Cards
        </button>
      </section>

      <section className={styles.transactions}>
        <div className={styles.transactionsHeader}>
          <h3>Recent Transactions</h3>

          <button>See all</button>
        </div>

        {loading && (
          <p>Loading transactions...</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={styles.transactionCard}
          >
            <div>
              <p className={styles.transactionTitle}>
                {transaction.from} → {transaction.to}
              </p>

              <span className={styles.transactionDate}>
                {transaction.date}
              </span>
            </div>

            <p
              className={
                transaction.amount > 0
                  ? styles.income
                  : styles.expense
              }
            >
              ${transaction.amount}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}