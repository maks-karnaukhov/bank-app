import { useRouter } from "next/navigation";
import styles from "./EmailVerifiedModal.module.css";

export default function EmailVerifiedModal() {
    const router = useRouter();

    const handleLogin = () => {
    router.push("/login");
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>🎉 Email verified successfully!</h2>
                <p className={styles.text}>
                    Your account has been activated.<br />
                    You can sign in using your email and password.
                </p>
                <button className={styles.redirectBtn} onClick={handleLogin}>
                    Go to Login
                </button>
            </div>
        </div>
    )
}