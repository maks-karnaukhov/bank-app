"use client";

import { isAxiosError } from "axios";
import { useState, useEffect } from "react";
import { 
    revealCardDetails,
    getCardRevealStatus,
    type CardDetails,
    type CardRevealError,
} from "@/services/cardApi";

import styles from "./CardDetails.module.css";

interface CardDetailsModalProps {
    cardId: string;
    onClose: () => void;
}

export default function CardDetailsModal({
    cardId,
    onClose,
}: CardDetailsModalProps) {
    const [password, setPassword] = useState("");
    const [details, setDetails] = useState<CardDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
    const [blockedUntil, setBlockedUntil] = useState<string | null>(null);

    useEffect(() => {
        const loadRevealStatus = async () => {
            try {
                const response =
                    await getCardRevealStatus(
                        cardId
                    );

                setAttemptsLeft(
                    response.data.attemptsLeft
                );

                setBlockedUntil(
                    response.data.blockedUntil
                );
            } catch {
                setError(
                    "Failed to load card security status"
                );
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
            if (isAxiosError<CardRevealError>(error)) { 
                const data = error.response?.data;

                if (data?.code === "CARD_REVEAL_BLOCKED") {
                    setAttemptsLeft(0);

                    if (data.retryAt) {
                        setBlockedUntil(data.retryAt);
                    }

                    setError(null);
                    return;
                }
                
                if ( data?.code === "INVALID_PASSWORD" ) { 
                    const remaining = data.attemptsLeft ?? 0; 
                    setAttemptsLeft( remaining ); 
                    setError( data.message || "Invalid password" ); 
                    return; 
                } 
                
                setError( data?.message || "Something went wrong" ); 
            } else { 
                setError( "Something went wrong" ); 
            }} finally { 
                setLoading(false); 
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
                    <button className={styles.close} onClick={onClose} > 
                        × 
                    </button>
                </div>

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
                            <p className={ styles.blocked } > 
                                Card details are temporarily locked. 
                                {formatRetryTime() && ( 
                                    <> {" "} Try again after{" "} 
                                        <strong> {formatRetryTime()} </strong> . 
                                    </>
                                )} 
                            </p> 
                        )}

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Password"
                            className={styles.input}
                            autoFocus
                        />

                        {error && !blockedUntil && (
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
                    </div>
                ) : (
                    <div className={styles.details}>
                        <div className={styles.field}>
                            <span>
                                Card number
                            </span>

                            <strong>
                                {details.number.replace(/(.{4})/g, "$1 ").trim()}
                            </strong>
                        </div>

                        <div className={styles.row}>
                            <div
                                className={
                                    styles.field
                                }
                            >
                                <span>
                                    Expiry date
                                </span>

                                <strong>
                                    {details.expiryDate}
                                </strong>
                            </div>

                            <div
                                className={
                                    styles.field
                                }
                            >
                                <span>
                                    CVV
                                </span>

                                <strong>
                                    {details.cvv}
                                </strong>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <span>
                                Cardholder
                            </span>

                            <strong>
                                {details.holderName}
                            </strong>
                        </div>

                        <div className={styles.info}>
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

                        <button
                            className={
                                styles.secondaryButton
                            }
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}