"use client";

import { isAxiosError } from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    revealCardDetails,
    getCardRevealStatus,
    type CardDetails,
    type CardRevealError,
} from "@/services/cardApi";

import {
    freezeCardThunk,
    unfreezeCardThunk,
    closeCardThunk,
    fetchCardsThunk,
} from "@/features/cards/cardsSlice";

import type {
    AppDispatch,
    RootState,
} from "@/store/store";

import styles from "./CardDetails.module.css";
import CloseCardModal from "../CloseCardModal/CloseCardModal";

interface CardDetailsModalProps {
    cardId: string;
    onClose: () => void;
}

export default function CardDetailsModal({
    cardId,
    onClose,
}: CardDetailsModalProps) {
    const dispatch = useDispatch<AppDispatch>();

    const card = useSelector(
        (state: RootState) =>
            state.cards.cards.find(
                (item) =>
                    item.id === cardId
            )
    );

    const [password, setPassword] = useState("");
    const [details, setDetails] = useState<CardDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
    const [blockedUntil, setBlockedUntil] = useState<string | null>(null);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

    useEffect(() => {
        const loadRevealStatus =
            async () => {
                try {
                    const response =
                        await getCardRevealStatus(cardId);

                    setAttemptsLeft(response.data.attemptsLeft);
                    setBlockedUntil(response.data.blockedUntil);
                } catch {
                    setError("Failed to load card security status");
                }
            };

        loadRevealStatus();
    }, [cardId]);

    const handleReveal = async () => {
        if (!password) {
            setError("Enter your password");

            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response =
                await revealCardDetails(
                    cardId,
                    password
                );

            setDetails(response.data);
            setPassword("");

            setAttemptsLeft(5);
            setBlockedUntil(null);
        } catch (error) {
            if (
                isAxiosError<CardRevealError>(error)
            ) {
                const data = error.response?.data;

                if (data?.code === "CARD_REVEAL_BLOCKED") {
                    setAttemptsLeft(0);

                    if (data.retryAt) {
                        setBlockedUntil(data.retryAt);
                    }

                    setError(null);

                    return;
                }

                if (data?.code === "INVALID_PASSWORD") {
                    const remaining =
                        data.attemptsLeft ?? 0;

                    setAttemptsLeft(remaining);

                    setError(data.message || "Invalid password");

                    return;
                }

                setError(data?.message || "Something went wrong");
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFreeze = async () => {
        try {
            setActionLoading(true);
            setError(null);

            await dispatch(freezeCardThunk(cardId)).unwrap();
        } catch (error) {
            setError(
                typeof error === "string"
                    ? error
                    : "Failed to freeze card"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnfreeze = async () => {
        try {
            setActionLoading(true);
            setError(null);

            await dispatch(unfreezeCardThunk(cardId)).unwrap();
        } catch (error) {
            setError(
                typeof error === "string"
                    ? error
                    : "Failed to unfreeze card"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseCard = async () => {
        try {
            await dispatch(closeCardThunk(cardId)).unwrap();

            await dispatch(fetchCardsThunk()).unwrap();

            onClose();
        } catch {
            setError("Failed to close card");
        }
    };

    const handleToggleFreeze = async () => {
        try {
            setError(null);

            if (card?.isFrozen) {
                await dispatch(unfreezeCardThunk(cardId)).unwrap();
            } else {
                await dispatch(freezeCardThunk(cardId)).unwrap();
            }

            await dispatch(fetchCardsThunk()).unwrap();
        } catch {
            setError(
                card?.isFrozen
                    ? "Failed to unfreeze card"
                    : "Failed to freeze card"
            );
        }
    };

    const formatRetryTime = () => {
        if (!blockedUntil) {
            return null;
        }

        const date = new Date(blockedUntil);

        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
        >
            <div
                className={styles.modal}
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className={styles.header}>
                    <h2>
                        Card details
                    </h2>

                    <button
                        className={styles.close}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {card?.isFrozen && (
                    <div
                        className={styles.frozenNotice}
                    >
                        This card is currently frozen.
                    </div>
                )}

                {!details ? (
                    <div className={styles.content}>
                        <p className={styles.description}>
                            Enter your account password
                            to reveal your card details.
                        </p>

                        {!blockedUntil &&
                            attemptsLeft !== null && (
                                <p className={styles.attempts}>
                                    Attempts remaining:{" "}
                                    <strong>
                                        {attemptsLeft}
                                    </strong>
                                </p>
                            )}

                        {blockedUntil && (
                            <p className={styles.blocked}>
                                Card details are
                                temporarily locked.

                                {formatRetryTime() && (
                                    <>
                                        {" "}
                                        Try again after{" "}
                                        <strong>
                                            {
                                                formatRetryTime()
                                            }
                                        </strong>
                                        .
                                    </>
                                )}
                            </p>
                        )}

                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Password"
                            className={styles.input}
                            autoFocus
                        />

                        {error &&
                            !blockedUntil && (
                                <p className={styles.error}>
                                    {error}
                                </p>
                            )}

                        <button 
                            className={styles.primaryButton}
                            onClick={handleReveal}
                            disabled={loading}
                        >
                            {loading
                                ? "Loading..."
                                : "Show card details"}
                        </button>

                        {card && !card.isClosed && (
                            <button
                                className={styles.secondaryButton}
                                onClick={handleToggleFreeze}
                            >
                                {card.isFrozen
                                    ? "Unfreeze card"
                                    : "Freeze card"}
                            </button>
                        )}
                        {card &&
                            !card.isVirtual &&
                            !card.isClosed && (
                                <button
                                    className={styles.dangerButton}
                                    onClick={() => setIsCloseModalOpen(true)}
                                    disabled={actionLoading}
                                >
                                    Close card
                                </button>
                        )}
                        {isCloseModalOpen && (
                            <CloseCardModal
                                onConfirm={handleCloseCard}
                                onCancel={() => setIsCloseModalOpen(false)}
                                loading={actionLoading}
                            />
                        )}
                    </div>
                ) : (
                    <div className={styles.details}>
                        <div
                            className={styles.field}
                        >
                            <span>
                                Card number
                            </span>

                            <strong>
                                {details.number
                                    .replace(
                                        /(.{4})/g,
                                        "$1 "
                                    )
                                    .trim()}
                            </strong>
                        </div>

                        <div
                            className={styles.row}
                        >
                            <div
                                className={styles.field}
                            >
                                <span>
                                    Expiry date
                                </span>

                                <strong>
                                    {
                                        details.expiryDate
                                    }
                                </strong>
                            </div>

                            <div
                                className={styles.field}
                            >
                                <span>
                                    CVV
                                </span>

                                <strong>
                                    {details.cvv}
                                </strong>
                            </div>
                        </div>

                        <div
                            className={styles.field}
                        >
                            <span>
                                Cardholder
                            </span>

                            <strong>
                                {
                                    details.holderName
                                }
                            </strong>
                        </div>

                        <div
                            className={styles.info}
                        >
                            <span>
                                {details.network}
                            </span>

                            <span>
                                {details.type}
                            </span>

                            {details.isVirtual && (
                                <span>
                                    Virtual card
                                </span>
                            )}
                        </div>

                        {error && (
                            <p
                                className={styles.error}
                            >
                                {error}
                            </p>
                        )}

                        {card && (
                            <div
                                className={styles.actions}
                            >
                                {card.isFrozen ? (
                                    <button
                                        className={styles.secondaryButton}
                                        onClick={handleUnfreeze}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading
                                            ? "Processing..."
                                            : "Unfreeze card"
                                        }
                                    </button>
                                ) : (
                                    <button
                                        className={styles.secondaryButton}
                                        onClick={handleFreeze}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading
                                            ? "Processing..."
                                            : "Freeze card"}
                                    </button>
                                )}

                                <button
                                    className={styles.dangerButton}
                                    onClick={handleCloseCard}
                                    disabled={actionLoading}
                                >
                                    Close card
                                </button>
                            </div>
                        )}

                        <button
                            className={styles.secondaryButton}
                            onClick={onClose}
                            disabled={actionLoading}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}