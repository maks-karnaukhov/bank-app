"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";

import {
  fetchCurrentUser,
  fetchCustomerFinancialProfile,
  fetchCurrentCreditRating,
  fetchCreditRatingEvents,
} from "@/services/api";

import styles from "./Profile.module.css";
import Image from "next/image";

interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
}

interface FinancialProfile {
  dateOfBirth: string;
  monthlyIncome: number;
  monthlyExternalDebtPayments: number;
  employmentType:
    | "EMPLOYED"
    | "SELF_EMPLOYED"
    | "ENTREPRENEUR"
    | "UNEMPLOYED"
    | "OTHER";
  employmentStartDate: string;
}

interface CreditRating {
  id: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

interface CreditRatingEvent {
  id: string;
  loanId?: string | null;
  type: string;
  points: number;
  scoreBefore: number;
  scoreAfter: number;
  createdAt: string;
}

const employmentLabels: Record<
  FinancialProfile["employmentType"],
  string
> = {
  EMPLOYED: "Employed",
  SELF_EMPLOYED: "Self-employed",
  ENTREPRENEUR: "Entrepreneur",
  UNEMPLOYED: "Unemployed",
  OTHER: "Other",
};

const eventLabels: Record<string, string> = {
  PAYMENT_ON_TIME: "On-time payment",
  PAYMENT_LATE: "Late payment",
  LOAN_PAID: "Loan fully repaid",
  LOAN_DEFAULTED: "Loan defaulted",
};

function formatDate(value?: string | null): string {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      "Unable to load this information."
    );
  }

  return "Unable to load this information.";
}

function getInitials(user: CurrentUser): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";

  return `${first}${last}`.toUpperCase() || "U";
}

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile | null>(null);
  const [creditRating, setCreditRating] =  useState<CreditRating | null>(null);
  const [ratingEvents, setRatingEvents] =  useState<CreditRatingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [financialError, setFinancialError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setPageError(null);

      const results = await Promise.allSettled([
        fetchCurrentUser(),
        fetchCustomerFinancialProfile(),
        fetchCurrentCreditRating(),
        fetchCreditRatingEvents(),
      ]);

      if (cancelled) return;

      const [
        userResult,
        financialResult,
        ratingResult,
        eventsResult,
      ] = results;

      if (userResult.status === "fulfilled") {
        setUser(userResult.value.data);
      } else {
        setPageError(getErrorMessage(userResult.reason));
      }

      if (financialResult.status === "fulfilled") {
        setFinancialProfile(financialResult.value.data);
        setFinancialError(null);
      } else {
        const error = financialResult.reason;

        if (
          isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setFinancialProfile(null);
          setFinancialError(null);
        } else {
          setFinancialError(getErrorMessage(error));
        }
      }

      if (ratingResult.status === "fulfilled") {
        setCreditRating(ratingResult.value.data);
        setRatingError(null);
      } else {
        setCreditRating(null);
        setRatingError(getErrorMessage(ratingResult.reason));
      }

      if (eventsResult.status === "fulfilled") {
        setRatingEvents(eventsResult.value.data);
        setHistoryError(null);
      } else {
        setRatingEvents([]);
        setHistoryError(getErrorMessage(eventsResult.reason));
      }

      setLoading(false);
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>Loading your profile...</p>
      </main>
    );
  }

  if (pageError || !user) {
    return (
      <main className={styles.page}>
        <section className={styles.errorPanel}>
          <h1>Profile unavailable</h1>
          <p>
            {pageError ??
              "We could not load your personal information."}
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>ACCOUNT</p>
          <h1>My Profile</h1>
          <p className={styles.subtitle}>
            Manage your personal and financial information.
          </p>
        </div>
      </header>

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
            <span className={user.isEmailVerified ? styles.verifiedBadge : styles.pendingBadge}
            >
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

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Financial profile</h2>
            <p>Information used to assess your financial situation.</p>
          </div>
        </div>

        {financialError ? (
          <div className={styles.notice}>
            {financialError}
          </div>
        ) : !financialProfile ? (
          <div className={styles.emptyState}>
            <h3>No financial profile yet</h3>
            <p>
              Your financial information has not been added.
              Once a profile is created, it will appear here.
            </p>
          </div>
        ) : (
          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span>Date of birth</span>
              <strong>{formatDate(financialProfile.dateOfBirth)}</strong>
            </div>

            <div className={styles.detail}>
              <span>Employment type</span>
              <strong>
                {employmentLabels[financialProfile.employmentType] ??
                  financialProfile.employmentType}
              </strong>
            </div>

            <div className={styles.detail}>
              <span>Monthly income</span>
              <strong>
                {formatAmount(financialProfile.monthlyIncome)}
                <small> per month</small>
              </strong>
            </div>

            <div className={styles.detail}>
              <span>External debt payments</span>
              <strong>
                {formatAmount(
                  financialProfile.monthlyExternalDebtPayments
                )}
                <small> per month</small>
              </strong>
            </div>

            <div className={styles.detail}>
              <span>Employment start date</span>
              <strong>
                {formatDate(financialProfile.employmentStartDate)}
              </strong>
            </div>
          </div>
        )}
      </section>

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

            <div className={styles.scoreTrack}>
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
                      event.points > 0
                        ? styles.positive
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
    </main>
  );
}