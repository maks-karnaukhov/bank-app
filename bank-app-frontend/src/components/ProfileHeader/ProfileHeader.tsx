import styles from "./ProfileHeader.module.css";

export default function ProfileHeader() {
  return (
    <header className={styles.pageHeader}>
      <div>
        <p className={styles.eyebrow}>ACCOUNT</p>

        <h1>My Profile</h1>

        <p className={styles.subtitle}>
          Manage your personal and financial information.
        </p>
      </div>
    </header>
  );
}