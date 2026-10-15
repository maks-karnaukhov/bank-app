"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";

import { fetchCards } from "@/services/cardApi";
import type { Card } from "@/types/types";

import {
    createLoanPayment,
    createEarlyLoanRepayment,
    getLoanById,
    getLoanPaymentSchedule,
} from "@/services/loanApi";

import type {
    Loan,
    LoanPaymentSchedule,
} from "@/services/loanApi";

import CardSelect from "@/components/CardSelect/CardSelect";

import styles from "./LoanPaymentModal.module.css";

type Props = {
    loanId: string;
    onClose: () => void;
    onSuccess: (
        loan: Loan,
        schedule: LoanPaymentSchedule[]
    ) => void;
};

type PaymentMode =
    | "SCHEDULED"
    | "EARLY_REPAYMENT";

export default function LoanPaymentModal({
    loanId,
    onClose,
    onSuccess,
}: Props) {
    const [cards, setCards] = useState<Card[]>([]);
    const [loan, setLoan] = useState<Loan | null>(null);
    const [schedule, setSchedule] = useState<LoanPaymentSchedule[]>([]);
    const [selectedCardId, setSelectedCardId] = useState("");
    const [paymentMode, setPaymentMode] = useState<PaymentMode>("SCHEDULED");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [
                    cardsResponse,
                    loanResponse,
                    scheduleResponse,
                ] = await Promise.all([
                    fetchCards(),
                    getLoanById(loanId),
                    getLoanPaymentSchedule(loanId),
                ]);

                const availableCards =
                    cardsResponse.data.filter(
                        (card) =>
                            card.isActive &&
                            !card.isFrozen &&
                            !card.isClosed
                    );

                setCards(availableCards);
                setLoan(loanResponse.data);
                setSchedule(scheduleResponse.data);

                if (availableCards.length > 0) {
                    setSelectedCardId(
                        availableCards[0].id
                    );
                }
            } catch (err) {
                if (isAxiosError(err)) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load payment information"
                    );
                } else {
                    setError("Failed to load payment information");
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [loanId]);

    const selectedCard = cards.find(
        (card) => card.id === selectedCardId
    );

    const nextPayment = schedule
        .filter(
            (item) =>
                item.status === "PENDING" ||
                item.status === "LATE"
        )
        .sort(
            (a, b) =>
                a.installmentNumber -
                b.installmentNumber
        )[0];

    const requiredAmount =
        paymentMode === "EARLY_REPAYMENT"
            ? loan?.remainingPrincipal ?? 0
            : nextPayment?.scheduledAmount ?? 0;

    const hasEnoughBalance =
        selectedCard !== undefined &&
        selectedCard.balance >= requiredAmount;

    const handlePayment = async () => {
        if (!selectedCardId) {
            setError("Select a card for payment");
            return;
        }

        if (requiredAmount <= 0) {
            setError(
                paymentMode === "EARLY_REPAYMENT"
                    ? "There is no outstanding principal to repay"
                    : "There is no scheduled payment available"
            );
            return;
        }

        if (!hasEnoughBalance) {
            setError("Insufficient card balance for this operation");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            if (paymentMode === "SCHEDULED") {
                await createLoanPayment(
                    loanId,
                    selectedCardId
                );
            } else {
                await createEarlyLoanRepayment(
                    loanId,
                    selectedCardId
                );
            }

            const [
                loanResponse,
                scheduleResponse,
            ] = await Promise.all([
                getLoanById(loanId),
                getLoanPaymentSchedule(loanId),
            ]);

            onSuccess(
                loanResponse.data,
                scheduleResponse.data
            );
        } catch (err) {
            if (isAxiosError(err)) {
                const code = err.response?.data?.code;

                const message = err.response?.data?.message;

                if (code === "INSUFFICIENT_FUNDS") {
                    setError("Insufficient card balance for this operation");
                } else {
                    setError(
                        message ||
                        "Failed to process loan payment"
                    );
                }
            } else {
                setError("Failed to process loan payment");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: selectedCard?.currency || "USD",
        }).format(amount);

    return (
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="loan-payment-title"
            >
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>
                            Loan payment
                        </p>

                        <h2 id="loan-payment-title">
                            Make a payment
                        </h2>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <p>Loading payment information...</p>
                ) : (
                    <div className={styles.form}>
                        <label
                            className={styles.label}
                            htmlFor="payment-card"
                        >
                            Pay from card
                        </label>

                        {cards.length === 0 ? (
                            <p className={styles.error}>
                                No active cards are available for payment.
                            </p>
                        ) : (
                            <CardSelect
                                id="payment-card"
                                cards={cards}
                                value={selectedCardId}
                                onChange={(cardId) => {
                                    setSelectedCardId(cardId);
                                    setError(null);
                                }}
                                disabled={submitting}
                                placeholder="Select a card"
                            />
                        )}

                        <div className={styles.paymentOptions}>
                            <button
                                type="button"
                                className={
                                    paymentMode === "SCHEDULED"
                                        ? styles.primaryButton
                                        : styles.secondaryButton
                                }
                                onClick={() => {
                                    setPaymentMode("SCHEDULED");
                                    setError(null);
                                }}
                                disabled={submitting}
                            >
                                Scheduled payment
                            </button>

                            <button
                                type="button"
                                className={
                                    paymentMode === "EARLY_REPAYMENT"
                                        ? styles.primaryButton
                                        : styles.secondaryButton
                                }
                                onClick={() => {
                                    setPaymentMode("EARLY_REPAYMENT");
                                    setError(null);
                                }}
                                disabled={submitting}
                            >
                                Repay principal
                            </button>
                        </div>

                        <div className={styles.paymentSummary}>
                            <span>
                                {paymentMode === "SCHEDULED"
                                    ? "Scheduled installment"
                                    : "Remaining principal"}
                            </span>

                            <strong>
                                {formatMoney(requiredAmount)}
                            </strong>

                            {paymentMode === "EARLY_REPAYMENT" && (
                                <p>
                                    This repays the remaining principal.
                                    Future pending installments will be cancelled.
                                </p>
                            )}
                        </div>

                        {selectedCard && !hasEnoughBalance && (
                            <p className={styles.error}>
                                The selected card does not have enough
                                balance for this payment.
                            </p>
                        )}

                        {error && (
                            <p className={styles.error}>
                                {error}
                            </p>
                        )}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handlePayment}
                                disabled={ 
                                    submitting ||
                                    !selectedCardId ||
                                    requiredAmount <= 0 ||
                                    !hasEnoughBalance
                                }
                            >
                                {submitting
                                    ? "Processing..."
                                    : paymentMode === "SCHEDULED"
                                    ? "Pay installment"
                                    : "Repay principal"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}