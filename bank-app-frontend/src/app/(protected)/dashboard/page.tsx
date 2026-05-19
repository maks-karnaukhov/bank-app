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
    </main>
  );
}