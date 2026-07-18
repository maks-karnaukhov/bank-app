"use client";

import { AuthErrorCode } from "@/services/auth/authErrors";
import clsx from "clsx";
import styles from "./RegisterForm.module.css";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, FieldProps } from "formik";

import { registerUserThunk } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { registerSchema } from "@/validation/registerSchema";
import InfoTooltip from "../InfoTooltip/InfoTooltip";
import { useAuthError } from "@/hooks/useAuthError";
import { useRetryTime } from "@/hooks/useRetryTime";

interface IProp {
  onRegisterSuccess: (email: string) => void;
}

export default function RegisterForm({ onRegisterSuccess }: IProp) {
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector(
    (state: RootState) => state.auth
  );

  const error = useSelector(
    (state: RootState) => state.auth.error
  );

  const timeLeft = useRetryTime(error?.retryAt);

  const errorMessage = useAuthError();

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      }}
      validationSchema={registerSchema}
      validateOnMount
      onSubmit={async (values, { setSubmitting }) => {
        const data = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          password: values.password,
        };

        const result = await dispatch(registerUserThunk(data));

        setSubmitting(false);

        if (registerUserThunk.fulfilled.match(result)) {
          onRegisterSuccess(values.email);
        }
      }}
    >
      {({ isValid, dirty, touched, errors }) => (
        <Form className={styles.form}>
          <div className={styles.field}>
            <Field
              name="firstName"
              placeholder="First name"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <Field
              name="lastName"
              placeholder="Last name"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <Field name="phone">
              {({ field, form }: FieldProps) => (
                <input
                  {...field}
                  type="tel"
                  placeholder="Phone"
                  className={styles.input}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");

                    form.setFieldValue(
                      "phone",
                      digits ? `+${digits}` : "+"
                    );
                  }}
                />
              )}
            </Field>

            <InfoTooltip
              title="Phone format"
              content={
                <>
                  • 10–15 digits<br />
                  • Starts with +<br />
                  • No letters allowed
                </>
              }
              isError={Boolean(touched.phone && errors.phone)}
            />
          </div>

          <div className={styles.field}>
            <Field
              name="email"
              placeholder="Email"
              className={styles.input}
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
              isError={Boolean(touched.email && errors.email)}
            />
          </div>

          <div className={styles.field}>
            <Field
              name="password"
              type="password"
              placeholder="Password"
              className={styles.input}
            />
            <InfoTooltip
              title="Password format"
              content={
                <>
                  • At least 8 characters<br />
                  • At least 1 uppercase letter (A-Z)<br />
                  • At least 1 lowercase letter (a-z)<br />
                  • At least 1 number (0-9)<br />
                  • At least 1 special character (!@#$%)
                </>
              }
              isError={Boolean(touched.password && errors.password)}
            />
          </div>

          <div className={styles.field}>
            <Field
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className={styles.input}
            />

            <InfoTooltip
              title="Confirm password"
              content={
                <>
                  • Must match the password above
                </>
              }
              isError={Boolean(
                touched.confirmPassword && errors.confirmPassword
              )}
            />
          </div>

          {errorMessage && (
            <p className={clsx(styles.error, styles.serverError)}>
              {errorMessage}

              {error?.code === AuthErrorCode.REGISTRATION_BLOCKED &&
                timeLeft && (
                  <>
                    {" "}
                    Please try again in {timeLeft.formatted}
                  </>
                )}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || !dirty || loading}
            className={styles.submitButton}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <a className={styles.linkA} href="/login">
            I already have an account
          </a>
        </Form>
      )}
    </Formik>
  );
}