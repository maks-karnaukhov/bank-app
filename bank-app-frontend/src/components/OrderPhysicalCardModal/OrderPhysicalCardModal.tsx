"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import {
    createCardOrder,
} from "@/services/cardOrderApi";

import type {
    CardOrder,
} from "@/services/cardOrderApi";

import styles from "./OrderPhysicalCardModal.module.css";

interface OrderPhysicalCardModalProps {
    onClose: () => void;
    onCreated: (order: CardOrder) => void;
}

const CARD_COLORS = [
    {
        name: "Blue",
        value: "#2563eb",
    },
    {
        name: "Black",
        value: "#111827",
    },
    {
        name: "Purple",
        value: "#7c3aed",
    },
    {
        name: "Green",
        value: "#059669",
    },
    {
        name: "Red",
        value: "#dc2626",
    },
    {
        name: "Orange",
        value: "#ea580c",
    },
];

export default function OrderPhysicalCardModal({
    onClose,
    onCreated,
}: OrderPhysicalCardModalProps) {
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [house, setHouse] = useState("");
    const [apartment, setApartment] = useState("");
    const [cardColor, setCardColor] = useState("#2563eb");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (
            !city.trim() ||
            !street.trim() ||
            !house.trim() ||
            !apartment.trim()
        ) {
            setError(
                "Please fill in all address fields"
            );

            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response =
                await createCardOrder({
                    city: city.trim(),
                    street: street.trim(),
                    house: house.trim(),
                    apartment: apartment.trim(),
                    cardColor,
                });

            onCreated(response.data);
        } catch (error) {
            if (isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                    "Failed to order physical card"
                );
            } else {
                setError(
                    "Failed to order physical card"
                );
            }
        } finally {
            setLoading(false);
        }
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
                        Order physical card
                    </h2>

                    <button
                        className={styles.close}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    <p
                        className={
                            styles.description
                        }
                    >
                        Your card will be delivered to
                        your home by a bank specialist.
                        The specialist will also help
                        you activate the card.
                    </p>

                    <div className={styles.form}>
                        <label>
                            City

                            <input
                                value={city}
                                onChange={(event) =>
                                    setCity(
                                        event.target.value
                                    )
                                }
                                className={
                                    styles.input
                                }
                                placeholder="City"
                            />
                        </label>

                        <label>
                            Street

                            <input
                                value={street}
                                onChange={(event) =>
                                    setStreet(
                                        event.target.value
                                    )
                                }
                                className={
                                    styles.input
                                }
                                placeholder="Street"
                            />
                        </label>

                        <div
                            className={
                                styles.row
                            }
                        >
                            <label>
                                House

                                <input
                                    value={house}
                                    onChange={(
                                        event
                                    ) =>
                                        setHouse(
                                            event.target
                                                .value
                                        )
                                    }
                                    className={
                                        styles.input
                                    }
                                    placeholder="House"
                                />
                            </label>

                            <label>
                                Apartment

                                <input
                                    value={
                                        apartment
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setApartment(
                                            event.target
                                                .value
                                        )
                                    }
                                    className={
                                        styles.input
                                    }
                                    placeholder="Apartment"
                                />
                            </label>
                        </div>

                        <div
                            className={
                                styles.colorSection
                            }
                        >
                            <span
                                className={
                                    styles.colorLabel
                                }
                            >
                                Card color
                            </span>

                            <div
                                className={
                                    styles.colorOptions
                                }
                            >
                                {CARD_COLORS.map(
                                    (color) => (
                                        <button
                                            key={
                                                color.value
                                            }
                                            type="button"
                                            className={`${styles.colorOption} ${
                                                cardColor ===
                                                color.value
                                                    ? styles.selectedColor
                                                    : ""
                                            }`}
                                            style={{
                                                backgroundColor:
                                                    color.value,
                                            }}
                                            onClick={() =>
                                                setCardColor(
                                                    color.value
                                                )
                                            }
                                            aria-label={`Select ${color.name} card`}
                                            title={
                                                color.name
                                            }
                                        />
                                    )
                                )}
                            </div>

                            <div
                                className={
                                    styles.preview
                                }
                            >
                                <span>
                                    Preview
                                </span>

                                <div
                                    className={
                                        styles.previewCard
                                    }
                                    style={{
                                        backgroundColor:
                                            cardColor,
                                    }}
                                >
                                    <span>
                                        Betta-Bank
                                    </span>

                                    <span>
                                        **** **** **** 0000
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}

                    <button
                        className={
                            styles.primaryButton
                        }
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? "Ordering..."
                            : "Order physical card"}
                    </button>
                </div>
            </div>
        </div>
    );
}