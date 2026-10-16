"use client";

import { useState, type FormEvent } from "react";

import { updateCustomerFinancialProfile } from "@/services/api";

import {
  employmentLabels,
  formatAmount,
  formatDate,
  getErrorMessage,
  toFinancialProfileForm,
} from "@/app/(protected)/profile/profile.utils";

import type {
  FinancialProfile,
  FinancialProfileForm,
} from "@/app/(protected)/profile/profile.types";

import styles from "./FinancialProfileSection.module.css";

interface FinancialProfileSectionProps {
  profile: FinancialProfile | null;
  error: string | null;
  onUpdated: (profile: FinancialProfile) => void;
}

export default function FinancialProfileSection({
  profile,
  error,
  onUpdated,
}: FinancialProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FinancialProfileForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    if (!profile) return;

    setForm(toFinancialProfileForm(profile));
    setFormError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm(null);
    setFormError(null);
  };

  const handleChange = (
    field: keyof FinancialProfileForm,
    value: string
  ) => {
    setForm((current) =>
      current ? { ...current, [field]: value } : current
    );

    setFormError(null);
    setSuccessMessage(null);
  };

  const validateForm = (
    values: FinancialProfileForm
  ): string | null => {
    if (!values.dateOfBirth) {
      return "Date of birth is required.";
    }

    if (!values.employmentStartDate) {
      return "Employment start date is required.";
    }

    const income = Number(values.monthlyIncome);
    const debtPayments = Number(
      values.monthlyExternalDebtPayments
    );

    if (
      values.monthlyIncome.trim() === "" ||
      !Number.isFinite(income) ||
      income < 0
    ) {
      return "Monthly income must be a valid non-negative number.";
    }

    if (
      values.monthlyExternalDebtPayments.trim() === "" ||
      !Number.isFinite(debtPayments) ||
      debtPayments < 0
    ) {
      return "Monthly debt payments must be a valid non-negative number.";
    }

    return null;
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form || isSaving) return;

    const validationError = validateForm(form);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      setSuccessMessage(null);

      const response = await updateCustomerFinancialProfile({
        dateOfBirth: form.dateOfBirth,
        monthlyIncome: Number(form.monthlyIncome),
        monthlyExternalDebtPayments: Number(form.monthlyExternalDebtPayments),
        employmentType: form.employmentType,
        employmentStartDate: form.employmentStartDate,
      });

      onUpdated(response.data);
      setIsEditing(false);
      setForm(null);
      setSuccessMessage("Financial profile updated successfully.");
    } catch (saveError) {
      setFormError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Financial profile</h2>
            <p>Your financial information</p>
          </div>
        </div>

        <div className={styles.errorPanel}>{error}</div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className={styles.section}>
        <h2>Financial profile</h2>
        <div className={styles.emptyState}>
          Financial profile is not available.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Financial profile</h2>
          <p>Your financial information</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleEdit}
          >
            Edit
          </button>
        )}
      </div>

      {successMessage && (
        <div className={styles.successMessage} role="status">
          {successMessage}
        </div>
      )}

      {isEditing && form ? (
        <form className={styles.editForm} onSubmit={handleSave}>
          <div className={styles.formGrid}>
            <label className={styles.formField}>
              <span>Date of birth</span>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => handleChange("dateOfBirth", event.target.value)}
                required
              />
            </label>

            <label className={styles.formField}>
              <span>Employment type</span>
              <select
                value={form.employmentType}
                onChange={(event) =>
                  handleChange(
                    "employmentType",
                    event.target.value
                  )
                }
                required
              >
                {Object.entries(employmentLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className={styles.formField}>
              <span>Monthly income</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.monthlyIncome}
                onChange={(event) => handleChange("monthlyIncome", event.target.value)}
                required
              />
            </label>

            <label className={styles.formField}>
              <span>Monthly external debt payments</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.monthlyExternalDebtPayments}
                onChange={(event) => handleChange("monthlyExternalDebtPayments", event.target.value)}
                required
              />
            </label>

            <label className={styles.formField}>
              <span>Employment start date</span>
              <input
                type="date"
                value={form.employmentStartDate}
                onChange={(event) => handleChange("employmentStartDate", event.target.value)}
                required
              />
            </label>
          </div>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.detailsGrid}>
          <div className={styles.detail}>
            <span>Date of birth</span>
            <strong>{formatDate(profile.dateOfBirth)}</strong>
          </div>

          <div className={styles.detail}>
            <span>Employment type</span>
            <strong>
              {employmentLabels[profile.employmentType]}
            </strong>
          </div>

          <div className={styles.detail}>
            <span>Monthly income</span>
            <strong>{formatAmount(profile.monthlyIncome)}</strong>
          </div>

          <div className={styles.detail}>
            <span>Monthly external debt payments</span>
            <strong>
              {formatAmount(profile.monthlyExternalDebtPayments)}
            </strong>
          </div>

          <div className={styles.detail}>
            <span>Employment start date</span>
            <strong>{formatDate(profile.employmentStartDate)}</strong>
          </div>
        </div>
      )}
    </section>
  );
}