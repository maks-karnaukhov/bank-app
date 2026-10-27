"use client";

import { Check } from "lucide-react";

import type { Transactions } from "@/types/types";

import styles from "./TransferSuccessModal.module.css";

interface TransferSuccessModalProps {
  transaction: Transactions;
  recipientLabel: string;
  destinationCardLast4?: string;
  isOwnTransfer: boolean;
  onClose: () => void;
}

export default function TransferSuccessModal({
  transaction,
  recipientLabel,
  destinationCardLast4,
  isOwnTransfer,
  onClose,
}: TransferSuccessModalProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: transaction.currency,
  }).format(transaction.amount);

  const formattedDate = new Date(transaction.date).toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-success-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.icon}>
          <Check size={30} strokeWidth={2.5} />
        </div>

        <h2 id="transfer-success-title">
          Transfer successful
        </h2>

        <p className={styles.subtitle}>
          Your money has been transferred successfully.
        </p>

        <div className={styles.amount}>
          {formattedAmount}
        </div>

        <div className={styles.status}>
          <span className={styles.statusDot} />
          Completed
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.label}>
              {isOwnTransfer ? "Destination account" : "Recipient"}
            </span>

            <span className={styles.value}>
              {recipientLabel}
            </span>
          </div>

          {destinationCardLast4 && (
            <div className={styles.detailRow}>
              <span className={styles.label}>
                Destination card
              </span>

              <span className={styles.value}>
                **** {destinationCardLast4}
              </span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.label}>
              Date and time
            </span>

            <span className={styles.value}>
              {formattedDate}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>
              Transaction ID
            </span>

            <span className={styles.transactionId}>
              {transaction.id}
            </span>
          </div>
        </div>

        <button
          className={styles.button}
          onClick={onClose}
        >
          Done
        </button>
      </section>
    </div>
  );
}