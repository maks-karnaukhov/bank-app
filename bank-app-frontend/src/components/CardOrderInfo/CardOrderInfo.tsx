"use client";

import type { CardOrder } from "@/services/cardOrderApi";

import styles from "./CardOrderInfo.module.css";

interface CardOrderInfoProps {
    order: CardOrder;
    title: string;
}

export default function CardOrderInfo({
    order,
    title,
}: CardOrderInfoProps) {
    const getStatusLabel = (
        status: CardOrder["status"]
    ) => {
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

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>
                        {title}
                    </p>

                    <h2>
                        {order.type === "CREDIT"
                            ? "Your credit card is on its way"
                            : "Your physical card is on its way"}
                    </h2>
                </div>

                <span className={styles.status}>
                    {getStatusLabel(order.status)}
                </span>
            </div>

            <div className={styles.info}>
                <div className={styles.infoItem}>
                    <span>Address</span>

                    <strong>
                        {order.deliveryAddress.street}{" "}
                        {order.deliveryAddress.house},{" "}
                        {order.deliveryAddress.apartment},{" "}
                        {order.deliveryAddress.city}
                    </strong>
                </div>

                {order.specialistName && (
                    <div className={styles.infoItem}>
                        <span>Specialist</span>

                        <strong>
                            {order.specialistName}
                        </strong>
                    </div>
                )}

                {order.scheduledAt ? (
                    <div className={styles.infoItem}>
                        <span>Visit</span>

                        <strong>
                            {formatDateTime(
                                order.scheduledAt
                            )}
                        </strong>
                    </div>
                ) : (
                    <div className={styles.pending}>
                        A bank specialist will contact
                        you to arrange the delivery date
                        and time.
                    </div>
                )}
            </div>
        </div>
    );
}