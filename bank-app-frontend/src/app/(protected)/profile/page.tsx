"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useDispatch } from "react-redux";

import { setUser as setAuthUser } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/store/store";

import type {
  CurrentUser,
  FinancialProfile,
  CreditRating,
  CreditRatingEvent,
} from "./profile.types";

import {
  getErrorMessage,
} from "./profile.utils";

import {
  fetchCurrentUser,
  fetchCustomerFinancialProfile,
  fetchCurrentCreditRating,
  fetchCreditRatingEvents,
} from "@/services/api";

import styles from "./Profile.module.css";

import ProfileHeader from "@/components/ProfileHeader/ProfileHeader";
import PersonalInfoSection from "@/components/PersonalInfoSection/PersonalInfoSection";
import FinancialProfileSection from "@/components/FinancialProfileSection/FinancialProfileSection";
import CreditRatingSection from "@/components/CreditRatingSection/CreditRatingSection";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile | null>(null);
  const [creditRating, setCreditRating] = useState<CreditRating | null>(null);
  const [ratingEvents, setRatingEvents] = useState<CreditRatingEvent[]>([]);
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
          setFinancialProfile(null);
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
            {pageError ?? "We could not load your personal information."}
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
      <ProfileHeader />
      <PersonalInfoSection
        user={user}
        onUpdated={(updatedUser) => {
          setUser(updatedUser);
          dispatch(setAuthUser(updatedUser));
        }}
      />
      <FinancialProfileSection
        profile={financialProfile}
        error={financialError}
        onUpdated={(updatedProfile) => {
          setFinancialProfile(updatedProfile);
          setFinancialError(null);
        }}
      />
      <CreditRatingSection
        creditRating={creditRating}
        ratingEvents={ratingEvents}
        ratingError={ratingError}
        historyError={historyError}
      />
    </main>
  );
}