import styles from "./BalanceCard.module.css";

export default function BalanceCard() {
    return (
        <section className={styles.balanceCard}>
            <div>
                <p className={styles.balanceLabel}>
                    Total Balance
                </p>

                <h2 className={styles.balance}>
                    $12,480.00
                </h2>
            </div>

            <div className={styles.balanceGrowth}>
                +2.5% this month
            </div>
      </section>
    )
}