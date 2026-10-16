import type {
  CreditRating,
  CreditRatingEvent,
} from "@/app/(protected)/profile/profile.types";

import {
  eventLabels,
  formatDate,
} from "@/app/(protected)/profile/profile.utils";

import styles from "./CreditRatingSection.module.css";

interface CreditRatingSectionProps {
  creditRating: CreditRating | null;
  ratingEvents: CreditRatingEvent[];
  ratingError: string | null;
  historyError: string | null;
}

export default function CreditRatingSection({
  creditRating,
  ratingEvents,
  ratingError,
  historyError,
}: CreditRatingSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Credit rating</h2>
          <p>Your current credit score and its history.</p>
        </div>
      </div>

      {ratingError ? (
        <div className={styles.notice}>{ratingError}</div>
      ) : creditRating ? (
        <div className={styles.ratingCard}>
          <div>
            <span className={styles.ratingLabel}>
              Current credit score
            </span>

            <div className={styles.score}>
              {creditRating.score}
              <span> / 850</span>
            </div>

            <p className={styles.ratingUpdated}>
              Last updated {formatDate(creditRating.updatedAt)}
            </p>
          </div>

          <div
            className={styles.scoreTrack}
            role="progressbar"
            aria-label="Credit score"
            aria-valuemin={0}
            aria-valuemax={850}
            aria-valuenow={Math.min(850, Math.max(0, creditRating.score))}
          >
            <div
              className={styles.scoreProgress}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, (creditRating.score / 850) * 100)
                )}%`,
              }}
            />
          </div>

          <p className={styles.scoreNote}>
            The score is based on your credit history and recorded
            repayment events.
          </p>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No credit rating available</h3>
          <p>Your credit score has not been created yet.</p>
        </div>
      )}

      <div className={styles.historyHeader}>
        <h3>Rating history</h3>
      </div>

      {historyError ? (
        <div className={styles.notice}>{historyError}</div>
      ) : ratingEvents.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No rating events have been recorded yet.</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {ratingEvents.map((event) => (
            <article className={styles.event} key={event.id}>
              <div className={styles.eventIcon}>
                {event.points > 0 ? "+" : "−"}
              </div>

              <div className={styles.eventInfo}>
                <strong>
                  {eventLabels[event.type] ?? event.type}
                </strong>

                <span>{formatDate(event.createdAt)}</span>
              </div>

              <div className={styles.eventScore}>
                <strong
                  className={
                    event.points > 0 ? styles.positive
                      : event.points < 0
                        ? styles.negative : ""
                  }
                >
                  {event.points > 0 ? "+" : ""}
                  {event.points}
                </strong>

                <span>
                  {event.scoreBefore} → {event.scoreAfter}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}