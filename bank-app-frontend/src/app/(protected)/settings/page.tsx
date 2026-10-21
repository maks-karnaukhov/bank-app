"use client";

import axios from "axios";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import * as Yup from "yup";
import { ShieldCheck } from "lucide-react";
import { newPasswordSchema } from "@/validation/NewPasswordSchema";
import {
  changePassword,
  requestEmailChange,
} from "@/services/api";
import OTPModal from "@/components/OTPModal/OTPModal";
import { setUser } from "@/features/auth/authSlice";
import styles from "./Settings.module.css";

const emailSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Current email is required"),

  newEmail: Yup.string()
    .email("Invalid email format")
    .required("New email is required")
    .notOneOf(
      [Yup.ref("email")],
      "New email must be different from current email"
    ),

  currentPassword: Yup.string()
    .required("Current password is required"),
});

const passwordSettingsSchema = newPasswordSchema.shape({
  currentPassword: Yup.string()
    .required("Current password is required"),
});

export default function SettingsPage() {
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account credentials and security.</p>
      </header>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.icon} aria-hidden="true">
            @
          </div>

          <div>
            <h2>Email Address</h2>
            <p>
              Update the email address associated with your account.
            </p>
          </div>
        </div>

        <Formik
          initialValues={{
            email: user?.email ?? "",
            newEmail: "",
            currentPassword: "",
          }}
          enableReinitialize
          validationSchema={emailSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setEmailMessage("");

            try {
                const response = await requestEmailChange({
                    newEmail: values.newEmail,
                    currentPassword: values.currentPassword,
                });

                setEmailChangePassword(values.currentPassword);
                setPendingEmail(values.newEmail.trim().toLowerCase());
                setIsEmailModalOpen(true);
                setEmailMessage(response.data.message || "Verification code sent to your new email.");

                resetForm({
                    values: {
                        email: user?.email ?? "",
                        newEmail: "",
                        currentPassword: "",
                    },
                });
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setEmailMessage(error.response?.data?.message || "Failed to send verification code. Please try again.");
                } else {
                    setEmailMessage("An unexpected error occurred. Please try again.");
                }
            } finally {
                setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className={styles.form} noValidate>
              <label htmlFor="email">Current email</label>
              <Field
                id="email"
                name="email"
                type="email"
                placeholder="Current email address"
                autoComplete="email"
                readOnly
              />
              <ErrorMessage
                name="email"
                component="p"
                className={styles.errorMessage}
              />

              <label htmlFor="newEmail">
                New email address
              </label>
              <Field
                id="newEmail"
                name="newEmail"
                type="email"
                placeholder="Enter new email address"
                autoComplete="email"
              />
              <ErrorMessage
                name="newEmail"
                component="p"
                className={styles.errorMessage}
              />
                <label htmlFor="currentPassword">
                Current password
              </label>
              <Field
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <ErrorMessage
                name="currentPassword"
                component="p"
                className={styles.errorMessage}
              />
              {emailMessage && (
                <p className={styles.message} role="status">
                  {emailMessage}
                </p>
              )}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting}
              >
                Update email
              </button>
            </Form>
          )}
        </Formik>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.icon} aria-hidden="true">
            <ShieldCheck size={22} strokeWidth={1.8} />
          </div>

          <div>
            <h2>Password &amp; Security</h2>
            <p>
              Choose a strong password to keep your account secure.
            </p>
          </div>
        </div>

        <Formik
          initialValues={{
            currentPassword: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={passwordSettingsSchema}
          onSubmit={async (values, { resetForm }) => {
            setPasswordMessage("");

            try {
                const response = await changePassword({
                    currentPassword: values.currentPassword,
                    newPassword: values.password,
                });

                setPasswordMessage(response.data.message || "Password changed successfully.");

                resetForm();
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setPasswordMessage(error.response?.data?.message || "Failed to change password. Please try again.");
                } else {
                    setPasswordMessage("An unexpected error occurred. Please try again.");
                }
            }
            }}
        >
          {({ isSubmitting }) => (
            <Form className={styles.form} noValidate>
              <label htmlFor="currentPassword">
                Current password
              </label>
              <Field
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <ErrorMessage
                name="currentPassword"
                component="p"
                className={styles.errorMessage}
              />

              <label htmlFor="password">New password</label>
              <Field
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <ErrorMessage
                name="password"
                component="p"
                className={styles.errorMessage}
              />

              <label htmlFor="confirmPassword">
                Confirm new password
              </label>
              <Field
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
              <ErrorMessage
                name="confirmPassword"
                component="p"
                className={styles.errorMessage}
              />

              {passwordMessage && (
                <p className={styles.message} role="status">
                  {passwordMessage}
                </p>
              )}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting}
              >
                Change password
              </button>
            </Form>
          )}
        </Formik>
      </section>
      {isEmailModalOpen && (
        <OTPModal
            email={pendingEmail}
            purpose="EMAIL_CHANGE"
            currentPassword={emailChangePassword}
            onSuccess={(updatedUser) => {
                if (updatedUser) {
                    dispatch(setUser(updatedUser));
                }

                setIsEmailModalOpen(false);
                setPendingEmail("");
                setEmailMessage("Email changed successfully.");
                setEmailChangePassword("");
            }}
            onClose={() => {
                setIsEmailModalOpen(false);
                setPendingEmail("");
                setEmailChangePassword("");
            }}
        />
      )}
    </main>
  );
}