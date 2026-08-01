"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";

import {
    getCurrentCardOrder,
} from "@/services/cardOrderApi";

import type {
    CardOrder,
} from "@/services/cardOrderApi";

import OrderPhysicalCardModal
    from "../OrderPhysicalCardModal/OrderPhysicalCardModal";

import styles from "./PhysicalCardSection.module.css";

export default function PhysicalCardSection() {
    const [order, setOrder] =
        useState<CardOrder | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError(null);

            const response =
                await getCurrentCardOrder();

            setOrder(response.data);
        } catch (error) {
            if (isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load card order"
                );
            } else {
                setError(
                    "Failed to load card order"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, []);

    const handleOrderCreated = (
        newOrder: CardOrder
    ) => {
        setOrder(newOrder);
        setIsModalOpen(false);
    };

    const formatDateTime = (
        value: string
    ) => {
        return new Date(value).toLocaleString(
            "en-US",
            {
                dateStyle: "long",
                timeStyle: "short",
            }
        );
    };

    if (loading) {
        return (
            <section className={styles.section}>
                <p>Loading physical card...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.section}>
                <div className={styles.card}>
                    <h2>
                        Physical card
                    </h2>

                    <p className={styles.error}>
                        {error}
                    </p>

                    <button
                        className={styles.secondaryButton}
                        onClick={loadOrder}
                    >
                        Try again
                    </button>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className={styles.section}>
                <div className={styles.card}>
                    {!order ? (
                        <>
                            <div>
                                <p
                                    className={
                                        styles.eyebrow
                                    }
                                >
                                    Physical card
                                </p>

                                <h2>
                                    Get a physical card
                                </h2>

                                <p
                                    className={
                                        styles.description
                                    }
                                >
                                    Order a physical card
                                    and have it delivered
                                    to your home by a
                                    bank specialist.
                                </p>
                            </div>

                            <button
                                className={
                                    styles.primaryButton
                                }
                                onClick={() =>
                                    setIsModalOpen(true)
                                }
                            >
                                Order physical card
                            </button>
                        </>
                    ) : (
                        <>
                            <div
                                className={
                                    styles.header
                                }
                            >
                                <div>
                                    <p
                                        className={
                                            styles.eyebrow
                                        }
                                    >
                                        Physical card
                                    </p>

                                    <h2>
                                        Your physical
                                        card is on its way
                                    </h2>
                                </div>

                                <span
                                    className={
                                        styles.status
                                    }
                                >
                                    {order.status ===
                                    "DELIVERY_SCHEDULED"
                                        ? "Delivery scheduled"
                                        : order.status ===
                                          "DELIVERED"
                                        ? "Delivered"
                                        : "Processing"}
                                </span>
                            </div>

                            <div
                                className={
                                    styles.info
                                }
                            >
                                <div
                                    className={
                                        styles.infoItem
                                    }
                                >
                                    <span>
                                        Address
                                    </span>

                                    <strong>
                                        {
                                            order
                                                .deliveryAddress
                                                .street
                                        }{" "}
                                        {
                                            order
                                                .deliveryAddress
                                                .house
                                        }
                                        {", "}
                                        {
                                            order
                                                .deliveryAddress
                                                .apartment
                                        }
                                        {", "}
                                        {
                                            order
                                                .deliveryAddress
                                                .city
                                        }
                                    </strong>
                                </div>

                                {order.specialistName && (
                                    <div
                                        className={
                                            styles.infoItem
                                        }
                                    >
                                        <span>
                                            Specialist
                                        </span>

                                        <strong>
                                            {
                                                order.specialistName
                                            }
                                        </strong>
                                    </div>
                                )}

                                {order.scheduledAt ? (
                                    <div
                                        className={
                                            styles.infoItem
                                        }
                                    >
                                        <span>
                                            Visit
                                        </span>

                                        <strong>
                                            {formatDateTime(
                                                order.scheduledAt
                                            )}
                                        </strong>
                                    </div>
                                ) : (
                                    <div
                                        className={
                                            styles.pending
                                        }
                                    >
                                        A bank specialist
                                        will contact you
                                        to arrange the
                                        delivery date and
                                        time.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {isModalOpen && (
                <OrderPhysicalCardModal
                    onClose={() =>
                        setIsModalOpen(false)
                    }
                    onCreated={
                        handleOrderCreated
                    }
                />
            )}
        </>
    );
}