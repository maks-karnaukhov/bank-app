import styles from "./CardItem.module.css";

import type {
    Card,
} from "@/types/types";

interface IProps {
    card: Card;
}

export default function CardItem({
    card,
}: IProps) {
    return (
        <div
            className={styles.card}
            style={{
                backgroundColor: card.color,
            }}
        >
            <div className={styles.top}>
                <span className={styles.type}>
                    {card.network} {
                        card.type === "DEBIT"
                            ? "Debit"
                            : "Credit"
                    }
                </span>

                <span className={styles.currency}>
                    {card.currency}
                </span>
            </div>

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