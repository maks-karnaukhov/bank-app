import styles from "./WelcomeBlock.module.css";

export default function WelcomeBlock() {
    return (
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
    )
}