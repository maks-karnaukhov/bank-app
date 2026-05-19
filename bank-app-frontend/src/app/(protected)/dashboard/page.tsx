import styles from "./Dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.container}>
      <section className={styles.top}>
        <div>
          <h1 className={styles.title}>
            Welcome back 👋
          </h1>

          <p className={styles.subtitle}>
            Here’s what’s happening with your finances today.
          </p>
        </div>
      </section>

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

      <section className={styles.actions}>
        <button className={styles.actionButton}>
          Transfer Money
        </button>

        <button className={styles.actionButton}>
          Transactions
        </button>

        <button className={styles.actionButton}>
          My Cards
        </button>
      </section>

      <section className={styles.transactions}>
        <div className={styles.transactionsHeader}>
          <h3>Recent Transactions</h3>

          <button>See all</button>
        </div>

        <div className={styles.transactionCard}>
          <div>
            <p className={styles.transactionTitle}>
              Netflix Subscription
            </p>

            <span className={styles.transactionDate}>
              Today
            </span>
          </div>

          <p className={styles.expense}>
            -$12.99
          </p>
        </div>

        <div className={styles.transactionCard}>
          <div>
            <p className={styles.transactionTitle}>
              Salary
            </p>

            <span className={styles.transactionDate}>
              Yesterday
            </span>
          </div>

          <p className={styles.income}>
            +$2,400
          </p>
        </div>

        <div className={styles.transactionCard}>
          <div>
            <p className={styles.transactionTitle}>
              Amazon Purchase
            </p>

            <span className={styles.transactionDate}>
              May 10
            </span>
          </div>

          <p className={styles.expense}>
            -$84.50
          </p>
        </div>
      </section>
    </main>
  );
}