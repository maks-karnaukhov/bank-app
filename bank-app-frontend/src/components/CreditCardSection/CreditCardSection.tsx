"use client";

import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

import type { RootState } from "@/store/store";

import CardDetailsModal from "../CardDetailsModal/CardDetailsModal";
import OrderCardModal from "../OrderCardModal/OrderCardModal";

import { getCurrentCardOrder } from "@/services/cardOrderApi";

import type { CardOrder } from "@/services/cardOrderApi";

import styles from "./CreditCardSection.module.css";
import CardOrderInfo from "../CardOrderInfo/CardOrderInfo";

export default function CreditCardSection() {
    const [order, setOrder] = useState<CardOrder | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const { cards } = useSelector((state: RootState) => state.cards);

    const creditCard = cards.find((card) => card.type === "CREDIT");

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const response = await getCurrentCardOrder("CREDIT");

                setOrder(response.data);
            } catch (error) {
                console.error(
                    "Get credit card order error:",
                    error
                );
            }
        };

        loadOrder();
    }, []);

    const handleOrderCreated = (newOrder: CardOrder) => {
        setOrder(newOrder);
        setIsOrderModalOpen(false);
    };

    const getOrderStatusLabel = (status: CardOrder["status"]) => {
        switch (status) {
            case "DELIVERY_SCHEDULED":
                return "Delivery scheduled";

            case "DELIVERED":
                return "Delivered";

            case "ACTIVATED":
                return "Activated";

            case "PROCESSING":
            case "ORDERED":
            default:
                return "Processing";
        }
    };

    const formatDateTime = (value: string) => {
        return new Date(value).toLocaleString(
            "en-US",
            {
                dateStyle: "long",
                timeStyle: "short",
            }
        );
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h2>Your credit card</h2>
                </div>
            </div>

            {creditCard ? (
                <div
                    className={styles.creditCard}
                    style={{
                        backgroundColor: creditCard.color,
                    }}
                >
                    <div className={styles.cardHeader}>
                        <span>{creditCard.network}</span>
                        <span>CREDIT</span>
                    </div>

                    <div className={styles.cardNumber}>
                        *** **** **** {creditCard.last4}
                    </div>

                    <div className={styles.cardBalance}>
                        <span>Available credit</span>

                        <strong>
                            $
                            {(
                                creditCard.availableCredit ?? 0
                            ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                    </div>

                    <div className={styles.creditInfo}>
                        <div>
                            <span>Credit limit</span>

                            <strong>
                                $
                                {(
                                    creditCard.creditLimit ?? 0
                                ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </strong>
                        </div>

                        <div>
                            <span>Used credit</span>

                            <strong>
                                $
                                {creditCard.usedCredit.toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className={styles.cardFooter}>
                        <span
                            className={creditCard.isFrozen ? styles.frozen : 
                                creditCard.isActive ? styles.active : styles.inactive
                            }
                        >
                            {creditCard.isFrozen ? "Frozen" :
                                creditCard.isActive ? "Active" : "Inactive"
                            }
                        </span>

                        <button
                            className={styles.secondaryButton}
                            onClick={() => setIsDetailsOpen(true)}
                        >
                            Manage card
                        </button>
                    </div>
                </div>
            ) : order ? (
                <CardOrderInfo
                    order={order}
                    title="Credit card"
                />
            ) : (
                <div className={styles.emptyCard}>
                    <div>
                        <h3>Get a credit card</h3>

                        <p>
                            Apply for a credit card
                            with a flexible credit
                            limit.
                        </p>
                    </div>

                    <button
                        className={styles.primaryButton}
                        onClick={() => setIsOrderModalOpen(true)}
                    >
                        Open credit card
                    </button>
                </div>
            )}

            {isDetailsOpen &&
                creditCard && (
                    <CardDetailsModal
                        cardId={creditCard.id}
                        onClose={() => setIsDetailsOpen(false)}
                    />
                )}

            {isOrderModalOpen && (
                <OrderCardModal
                    type="CREDIT"
                    onClose={() => setIsOrderModalOpen(false)}
                    onCreated={handleOrderCreated}
                />
            )}
        </section>
    );
}