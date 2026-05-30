"use client";

import clsx from "clsx";
import styles from "./RegisterForm.module.css";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";

import { registerUserThunk } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { registerSchema } from "@/validation/registerSchema";
import InfoTooltip from "../InfoTooltip/InfoTooltip";
import { useAuthError } from "@/hooks/useAuthError";

interface IProp {
  onRegisterSuccess: (email: string) => void;
}

export default function RegisterForm({ onRegisterSuccess }: IProp) {
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector(
    (state: RootState) => state.auth
  );

  const errorMessage = useAuthError();

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
      }}
      validationSchema={registerSchema}
      validateOnMount
      onSubmit={async (values, { setSubmitting }) => {
        const result = await dispatch(registerUserThunk(values));

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
            <Field
              name="phone"
              placeholder="Phone"
              className={styles.input}
            />

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

          {errorMessage && (
            <p className={clsx(styles.error, styles.serverError)}>
              {errorMessage}
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