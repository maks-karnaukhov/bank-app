import Image from "next/image";

import type { CurrentUser } from "@/app/(protected)/profile/profile.types";
import { getInitials } from "@/app/(protected)/profile/profile.utils";

import styles from "./PersonalInfoSection.module.css";

interface PersonalInfoSectionProps {
  user: CurrentUser;
}

export default function PersonalInfoSection({
  user,
}: PersonalInfoSectionProps) {
  return (
    <section className={styles.personalCard}>
      <div className={styles.identity}>
        {user.avatarUrl ? (
          <Image
            className={styles.avatar}
            src={user.avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
            width={76}
            height={76}
            unoptimized
          />
        ) : (
          <div className={styles.avatarFallback}>
            {getInitials(user)}
          </div>
        )}

        <div className={styles.identityText}>
          <h2>
            {user.firstName} {user.lastName}
          </h2>

          <p>{user.email}</p>

          <span className={user.isEmailVerified ? styles.verifiedBadge : styles.pendingBadge}>
            {user.isEmailVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detail}>
          <span>First name</span>
          <strong>{user.firstName || "Not provided"}</strong>
        </div>

        <div className={styles.detail}>
          <span>Last name</span>
          <strong>{user.lastName || "Not provided"}</strong>
        </div>

        <div className={styles.detail}>
          <span>Email address</span>
          <strong className={styles.breakable}>
            {user.email}
          </strong>
        </div>

        <div className={styles.detail}>
          <span>Phone number</span>
          <strong>{user.phone || "Not provided"}</strong>
        </div>
      </div>
    </section>
  );
}