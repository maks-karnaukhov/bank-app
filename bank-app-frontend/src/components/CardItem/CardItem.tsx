import styles from "./CardItem.module.css";

import type {
    Card,
} from "@/types/types";

interface IProps {
    card: Card;
    onClick: () => void;
}

export default function CardItem({
    card,
    onClick,
}: IProps) {
    const statusClass = card.isFrozen
        ? styles.frozen
        : "";

    return (
        <div
            className={`${styles.card} ${statusClass}`}
            style={{
                backgroundColor: card.color,
            }}
            onClick={onClick}
        >
            <div className={styles.top}>
                <span className={styles.type}>
                    {card.network === "VISA"
                        ? "Visa"
                        : card.network
                    }{" "}
                    {card.type === "DEBIT"
                        ? "Debit"
                        : "Credit"
                    }
                </span>

                <span className={styles.currency}>
                    {card.currency}
                </span>
            </div>

            {card.isFrozen && (
                <span className={styles.status}>
                    Frozen
                </span>
            )}

            <div className={styles.number}>
                **** **** **** {card.last4}
            </div>

            <div className={styles.bottom}>
                <div>
                    <p className={styles.label}>
                        Balance
                    </p>

                    <h3 className={styles.balance}>
                        {card.balance.toLocaleString()}{" "}
                        {card.currency}
                    </h3>
                </div>
            </div>
        </div>
    );
}