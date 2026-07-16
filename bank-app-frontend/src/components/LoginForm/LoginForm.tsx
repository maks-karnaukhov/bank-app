"use client";

import clsx from "clsx";
import styles from "./LoginForm.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";

import { loginUserThunk } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { loginSchema } from "@/validation/LoginSchema";
import InfoTooltip from "../InfoTooltip/InfoTooltip";
import { useState } from "react";

interface IProp {
  onForgotPassword: () => void;
}

export default function LoginForm({onForgotPassword}: IProp) {
  const [authError, setAuthError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading } = useSelector(
    (state: RootState) => state.auth
  );

  const hasAuthError = !!authError;

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginSchema}
      validateOnMount
      onSubmit={async (values, { setSubmitting }) => {
        setAuthError(null);

        const result = await dispatch(loginUserThunk(values));

        setSubmitting(false);

        if (loginUserThunk.fulfilled.match(result)) {
          router.replace("/dashboard");
          return;
        }

        setAuthError("Invalid email or password");
      }}
    >
      {({
        isValid,
        touched,
        errors,
        setFieldValue,
        setFieldTouched,
      }) => (
        <Form className={styles.form}>
          <div className={styles.field}>
            <Field
              name="email"
              type="email"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setAuthError(null);
                setFieldValue("email", e.target.value);
              }}
              placeholder="Email"
              className={clsx(
                styles.input,
                touched.email && errors.email && styles.inputError,
                hasAuthError && styles.inputError
              )}
              onBlur={() => setFieldTouched("email", true)}
            />
            <InfoTooltip
              title="Email format"
              content={
                <>
                  • At least 8 characters<br />
                  • 1 uppercase letter<br />
                  • 1 lowercase letter<br />
                  • 1 special character
                </>
              }
              isError={Boolean(touched.email && errors.email) || hasAuthError}
            />
          </div>
          <Field
            name="password"
            type="password"
            placeholder="Password"
            className={clsx(
              styles.input,
              touched.password && errors.password && styles.inputError,
              hasAuthError && styles.inputError
            )}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setAuthError(null);
              setFieldValue("password", e.target.value);
            }}
            onBlur={() => setFieldTouched("password", true)}
          />

          {authError && (
            <p className={styles.error}>
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className={styles.submitButton}
          >
            {loading ? "Please wait..." : "Sign in"}
          </button>

          <button type="button" className={styles.linkA} onClick={onForgotPassword}>
            Forgot password?
          </button>

          <a className={styles.linkA} href="/register">
            Create account
          </a>
        </Form>
      )}
    </Formik>
  );
}