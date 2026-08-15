import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

import styles from "./BalanceCard.module.css";

export default function BalanceCard() {
    const cards = useSelector(
        (state: RootState) => state.cards.cards
    );

    const totalBalance = cards
        .filter(
            (card) =>
                card.isActive &&
                !card.isClosed
        )
        .reduce(
            (total, card) =>
                total + card.balance,
            0
        );

    const formattedBalance =
        new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
            }
        ).format(totalBalance);

    return (
        <section className={styles.balanceCard}>
            <div>
                <p className={styles.balanceLabel}>
                    Total Balance
                </p>

                <h2 className={styles.balance}>
                    {formattedBalance}
                </h2>
            </div>

            <div className={styles.balanceGrowth}>
                +2.5% this month
            </div>
        </section>
    );
}