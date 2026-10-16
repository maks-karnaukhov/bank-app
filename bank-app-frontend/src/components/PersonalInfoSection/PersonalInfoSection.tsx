"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";

import type { CurrentUser } from "@/app/(protected)/profile/profile.types";
import {
  getInitials,
  getErrorMessage,
} from "@/app/(protected)/profile/profile.utils";

import { updateCurrentUser } from "@/services/api";

import styles from "./PersonalInfoSection.module.css";
import financialStyles from "@/components/FinancialProfileSection/FinancialProfileSection.module.css";

interface PersonalInfoSectionProps {
  user: CurrentUser;
  onUpdated: (updatedUser: CurrentUser) => void;
}

type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  phone: string;
};

type PersonalInfoFieldErrors = Partial<
  Record<keyof PersonalInfoForm, string>
>;

export default function PersonalInfoSection({
  user,
  onUpdated,
}: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] =
    useState<PersonalInfoFieldErrors>({});

  const [form, setForm] = useState<PersonalInfoForm>({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
  });

  const resetForm = () => {
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
    });
  };

  const handleEdit = () => {
    resetForm();
    setFieldErrors({});
    setError(null);
    setSuccess(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
    setFieldErrors({});
    setError(null);
    setIsEditing(false);
  };

  const handleChange = (
    field: keyof PersonalInfoForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    const errors: PersonalInfoFieldErrors = {};

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();

    const namePattern =
      /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;

    if (!firstName) {
      errors.firstName = "First name is required.";
    } else if (firstName.length > 100) {
      errors.firstName =
        "First name must not exceed 100 characters.";
    } else if (!namePattern.test(firstName)) {
      errors.firstName = "Enter a valid first name.";
    }

    if (!lastName) {
      errors.lastName = "Last name is required.";
    } else if (lastName.length > 100) {
      errors.lastName =
        "Last name must not exceed 100 characters.";
    } else if (!namePattern.test(lastName)) {
      errors.lastName = "Enter a valid last name.";
    }

    if (!phone) {
      errors.phone = "Phone number is required.";
    } else if (!/^\+\d{10,15}$/.test(phone)) {
      errors.phone =
        "Phone number must start with + and contain 10–15 digits.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSaving) return;

    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setError("Please correct the highlighted fields.");
      return;
    }

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();

    try {
      setIsSaving(true);

      const response = await updateCurrentUser({
        firstName,
        lastName,
        phone,
      });

      onUpdated(response.data as CurrentUser);

      setFieldErrors({});
      setIsEditing(false);
      setSuccess("Personal information updated successfully.");
    } catch (saveError) {
      if (isAxiosError(saveError)) {
        setError(getErrorMessage(saveError));
      } else {
        setError(
          "Failed to update personal information."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.personalCard}>
      <div className={styles.sectionHeader}>
        <h2>Personal information</h2>

        {!isEditing && (
          <button
            type="button"
            className={financialStyles.secondaryButton}
            onClick={handleEdit}
          >
            Edit
          </button>
        )}
      </div>

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
          <h3>
            {user.firstName} {user.lastName}
          </h3>

          <p>{user.email}</p>

          <span className={user.isEmailVerified ? styles.verifiedBadge : styles.pendingBadge}>
            {user.isEmailVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>
      </div>

      {success && (
        <p
          className={styles.successMessage}
          role="status"
        >
          {success}
        </p>
      )}

      {error && (
        <p
          className={styles.errorMessage}
          role="alert"
        >
          {error}
        </p>
      )}

      {isEditing ? (
        <form
          className={styles.editForm}
          onSubmit={handleSave}
          noValidate
        >
          <label className={styles.formField}>
            <span>First name</span>

            <input
              type="text"
              value={form.firstName}
              onChange={(event) => handleChange("firstName", event.target.value)}
              maxLength={100}
              autoComplete="given-name"
              required
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? "personal-first-name-error" : undefined}
              disabled={isSaving}
            />

            {fieldErrors.firstName && (
              <span
                id="personal-first-name-error"
                className={styles.fieldError}
              >
                {fieldErrors.firstName}
              </span>
            )}
          </label>

          <label className={styles.formField}>
            <span>Last name</span>

            <input
              type="text"
              value={form.lastName}
              onChange={(event) => handleChange("lastName", event.target.value)}
              maxLength={100}
              autoComplete="family-name"
              required
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? "personal-last-name-error" : undefined}
              disabled={isSaving}
            />

            {fieldErrors.lastName && (
              <span
                id="personal-last-name-error"
                className={styles.fieldError}
              >
                {fieldErrors.lastName}
              </span>
            )}
          </label>

          <label className={styles.formField}>
            <span>Phone number</span>

            <input
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              maxLength={16}
              placeholder="+79991234567"
              autoComplete="tel"
              required
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "personal-phone-error" : undefined}
              disabled={isSaving}
            />

            {fieldErrors.phone && (
              <span
                id="personal-phone-error"
                className={styles.fieldError}
              >
                {fieldErrors.phone}
              </span>
            )}
          </label>

          <div className={styles.formActions}>
            <button
              type="button"
              className={financialStyles.secondaryButton}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={financialStyles.primaryButton}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.detailsGrid}>
          <div className={styles.detail}>
            <span>First name</span>
            <strong>
              {user.firstName || "Not provided"}
            </strong>
          </div>

          <div className={styles.detail}>
            <span>Last name</span>
            <strong>
              {user.lastName || "Not provided"}
            </strong>
          </div>

          <div className={styles.detail}>
            <span>Email address</span>
            <strong className={styles.breakable}>
              {user.email}
            </strong>
          </div>

          <div className={styles.detail}>
            <span>Phone number</span>
            <strong>
              {user.phone || "Not provided"}
            </strong>
          </div>
        </div>
      )}
    </section>
  );
}