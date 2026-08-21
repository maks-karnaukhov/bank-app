"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";

import { getCurrentCardOrder } from "@/services/cardOrderApi";
import { fetchCards } from "@/services/cardApi";

import type { CardOrder } from "@/services/cardOrderApi";

import OrderCardModal from "../OrderCardModal/OrderCardModal";
import CardOrderInfo from "../CardOrderInfo/CardOrderInfo";

import styles from "./PhysicalCardSection.module.css";

const MAX_PHYSICAL_CARDS = 5;

export default function PhysicalCardSection() {
    const [order, setOrder] = useState<CardOrder | null>(null);
    const [physicalCardCount, setPhysicalCardCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                orderResponse,
                cardsResponse,
            ] = await Promise.all([
                getCurrentCardOrder("PHYSICAL"),
                fetchCards(),
            ]);

            setOrder(orderResponse.data);

            const physicalCards = cardsResponse.data.filter((card) => !card.isVirtual);

            setPhysicalCardCount(physicalCards.length);
        } catch (error) {
            if (isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load physical card information"
                );
            } else {
                setError("Failed to load physical card information");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOrderCreated = (
        newOrder: CardOrder
    ) => {
        setOrder(newOrder);
        setIsModalOpen(false);
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
                    <h2>Physical card</h2>

                    <p className={styles.error}>{error}</p>

                    <button
                        className={styles.secondaryButton}
                        onClick={loadData}
                    >
                        Try again
                    </button>
                </div>
            </section>
        );
    }

    const maxCardsReached = physicalCardCount >= MAX_PHYSICAL_CARDS;

    return (
        <>
            <section className={styles.section}>
                <div className={styles.card}>
                    {maxCardsReached ? (
                        <div>
                            <p className={styles.eyebrow}>Physical cards</p>

                            <h2>
                                Maximum number of
                                cards reached
                            </h2>

                            <p className={styles.description}>
                                You already have the
                                maximum number of
                                physical cards allowed.
                            </p>
                        </div>
                    ) : !order ? (
                        <>
                            <div>
                                <p className={styles.eyebrow}>Physical card </p>

                                <h2>Get a physical card</h2>

                                <p className={styles.description}>
                                    Order a physical card
                                    and have it delivered
                                    to your home by a
                                    bank specialist.
                                </p>
                            </div>

                            <button
                                className={styles.primaryButton}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Order physical card
                            </button>
                        </>
                    ) : (
                        <CardOrderInfo
                            order={order}
                            title="Physical card"
                        />
                    )}
                </div>
            </section>

            {isModalOpen && (
                <OrderCardModal
                    type="PHYSICAL"
                    onClose={() => setIsModalOpen(false)}
                    onCreated={handleOrderCreated}
                />
            )}
        </>
    );
}