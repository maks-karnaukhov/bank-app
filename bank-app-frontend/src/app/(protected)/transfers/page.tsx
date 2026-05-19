"use client";

import { useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import styles from "./Transfer.module.css";

import {
  createTransactionThunk,
} from "@/features/transactions/transactionsSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";

export default function TransferPage() {
  const dispatch =
    useDispatch<AppDispatch>();

  const { loading, error } =
    useSelector(
      (state: RootState) =>
        state.transactions
    );

  const [recipient, setRecipient] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    await dispatch(
      createTransactionThunk({
        to: recipient,
        amount: Number(amount),
      })
    );

    setRecipient("");
    setAmount("");
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          Transfer Money
        </h1>

        <p className={styles.subtitle}>
          Send money securely to another account
        </p>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.accountBox}>
            <span className={styles.accountLabel}>
              From
            </span>

            <h3 className={styles.accountName}>
              Main USD Account
            </h3>

            <p className={styles.accountBalance}>
              Balance: $12,480.00
            </p>
          </div>

          <input
            type="text"
            placeholder="Recipient account"
            value={recipient}
            onChange={(e) =>
              setRecipient(e.target.value)
            }
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Transfer"}
          </button>

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}