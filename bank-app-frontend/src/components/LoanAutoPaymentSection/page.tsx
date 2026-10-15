"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import { isAxiosError } from "axios";

import {
    getLoanAutoPayment,
    enableLoanAutoPayment,
    disableLoanAutoPayment,
    executeLoanAutoPayment,
    type Loan,
    type LoanAutoPayment,
} from "@/services/loanApi";

import { fetchCards } from "@/services/cardApi";
import type { Card } from "@/types/types";

import CardSelect from "@/components/CardSelect/CardSelect";

import styles from "./LoanAutoPaymentSection.module.css";

type LoanAutoPaymentSectionProps = {
    loanId: string;
    loanStatus: Loan["status"];
    onPaymentSuccess: () => void;
};

export default function LoanAutoPaymentSection({
    loanId,
    loanStatus,
    onPaymentSuccess,
}: LoanAutoPaymentSectionProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [autoPayment, setAutoPayment] = useState<LoanAutoPayment | null>(null);
    const [selectedCardId, setSelectedCardId] = useState("");
    const [isCardSelectOpen, setIsCardSelectOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const cardSelectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [cardsResult, autoPaymentResult] =
                    await Promise.allSettled([
                        fetchCards(),
                        getLoanAutoPayment(loanId),
                    ]);

                if (cancelled) return;

                if (cardsResult.status === "fulfilled") {
                    const availableCards =
                        cardsResult.value.data.filter(
                            (card) =>
                                card.isActive &&
                                !card.isFrozen &&
                                !card.isClosed
                        );

                    setCards(availableCards);
                } else {
                    setError("Failed to load cards");
                }

                if (autoPaymentResult.status === "fulfilled") {
                    const currentAutoPayment = autoPaymentResult.value.data.autoPayment;

                    setAutoPayment(currentAutoPayment);

                    if (currentAutoPayment) {
                        setSelectedCardId(currentAutoPayment.cardId);
                    }
                } else {
                    setError("Failed to load auto-payment settings");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {cancelled = true;};
    }, [loanId]);

    useEffect(() => {
        if (!isCardSelectOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (cardSelectRef.current && !cardSelectRef.current.contains(event.target as Node)) {
                setIsCardSelectOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsCardSelectOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isCardSelectOpen]);

    const refreshAutoPayment = async () => {
        const response = await getLoanAutoPayment(loanId);
        const currentAutoPayment = response.data.autoPayment;

        setAutoPayment(currentAutoPayment);

        if (currentAutoPayment) {
            setSelectedCardId(currentAutoPayment.cardId);
        }
    };

    const handleEnable = async () => {
        if (!selectedCardId) {
            setError("Select a card for automatic payments");
            return;
        }

        try {
            setBusy(true);
            setError(null);
            setMessage(null);

            await enableLoanAutoPayment(loanId, selectedCardId);
            await refreshAutoPayment();

            setMessage("Automatic payments enabled");
        } catch (error) {
            setError(
                isAxiosError(error)
                    ? error.response?.data?.message ||
                      "Failed to enable automatic payments"
                    : "Failed to enable automatic payments"
            );
        } finally {
            setBusy(false);
        }
    };

    const handleDisable = async () => {
        try {
            setBusy(true);
            setError(null);
            setMessage(null);

            await disableLoanAutoPayment(loanId);
            await refreshAutoPayment();

            setMessage("Automatic payments disabled");
        } catch (error) {
            setError(
                isAxiosError(error)
                    ? error.response?.data?.message ||
                      "Failed to disable automatic payments"
                    : "Failed to disable automatic payments"
            );
        } finally {
            setBusy(false);
        }
    };

    const handleExecute = async () => {
        try {
            setBusy(true);
            setError(null);
            setMessage(null);

            await executeLoanAutoPayment(loanId);
            await refreshAutoPayment();

            setMessage("Payment processed successfully");
            onPaymentSuccess();
        } catch (error) {
            setError(
                isAxiosError(error)
                    ? error.response?.data?.message ||
                      "Failed to execute automatic payment"
                    : "Failed to execute automatic payment"
            );

            try {
                await refreshAutoPayment();
            } catch {
                // Preserve the original payment error.
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className={styles.autoPayment}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>
                        Payment settings
                    </p>

                    <h2 className={styles.title}>
                        Automatic payments
                    </h2>

                    <p className={styles.description}>
                        Automatically pay scheduled loan
                        installments using your selected card.
                    </p>
                </div>

                <span className={autoPayment?.isEnabled ? styles.enabled : styles.disabled}>
                    {autoPayment?.isEnabled ? "Enabled" : "Disabled"}
                </span>
            </div>

            {loading ? (
                <p>Loading auto-payment settings...</p>
            ) : (
                <>
                    {error && (
                        <p
                            className={styles.error}
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {message && (
                        <p
                            className={styles.message}
                            role="status"
                        >
                            {message}
                        </p>
                    )}

                    <label className={styles.fieldLabel}>
                        Card for automatic payments
                    </label>

                    <CardSelect
                        id="auto-payment-card"
                        cards={cards}
                        value={selectedCardId}
                        onChange={(cardId) => {
                            setSelectedCardId(cardId);
                            setError(null);
                            setMessage(null);
                        }}
                        disabled={
                            busy ||
                            autoPayment?.isEnabled === true ||
                            loanStatus !== "ACTIVE"
                        }
                        placeholder="Select a card"
                    />

                    {cards.length === 0 && (
                        <p className={styles.description}>
                            No eligible cards are available.
                            Activate an unfrozen card to enable
                            automatic payments.
                        </p>
                    )}

                    {autoPayment?.lastSuccessfulPaymentAt && (
                        <p className={styles.meta}>
                            Last successful payment:{" "}
                            {new Date(autoPayment.lastSuccessfulPaymentAt).toLocaleString("en-US")}
                        </p>
                    )}

                    {autoPayment?.lastError && (
                        <p className={styles.error}>
                            Last payment error:{" "}
                            {autoPayment.lastError}
                        </p>
                    )}

                    <div className={styles.actions}>
                        {autoPayment?.isEnabled ? (
                            <>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={handleDisable}
                                    disabled={busy}
                                >
                                    Disable
                                </button>

                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={handleExecute}
                                    disabled={
                                        busy ||
                                        loanStatus !== "ACTIVE"
                                    }
                                >
                                    {busy ? "Processing..." : "Pay now"}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleEnable}
                                disabled={
                                    busy ||
                                    loanStatus !== "ACTIVE" ||
                                    !selectedCardId ||
                                    cards.length === 0
                                }
                            >
                                {busy ? "Saving..." : "Enable auto-payment"}
                            </button>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}