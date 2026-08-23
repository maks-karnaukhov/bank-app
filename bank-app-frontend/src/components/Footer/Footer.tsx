import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.main}>
                    <div className={styles.brand}>
                        <strong>Betta-bank</strong>

                        <p>
                            Simple and secure banking
                            for everyday life.
                        </p>
                    </div>

                    <nav className={styles.nav}>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Support</a>
                    </nav>
                </div>

                <div className={styles.bottom}>
                    <span>
                        © 2026 Betta-bank
                    </span>

                    <span>
                        Secure banking experience
                    </span>
                </div>
            </div>
        </footer>
    );
}