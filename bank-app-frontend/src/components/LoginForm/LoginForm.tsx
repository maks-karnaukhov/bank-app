"use client";

import styles from "./LoginForm.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";

import { loginUserThunk } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { loginSchema } from "@/validation/LoginSchema";
import InfoTooltip from "../InfoTooltip/InfoTooltip";

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginSchema}
      validateOnMount
      onSubmit={async (values) => {
        const result = await dispatch(loginUserThunk(values));

        if (loginUserThunk.fulfilled.match(result)) {
          router.replace("/dashboard");
        }
      }}
    >
      {({ dirty, isValid, touched, errors }) => (
        <Form className={styles.form}>
          <div className={styles.field}>
            <Field
              name="email"
              type="email"
              placeholder="Email"
              className={`${styles.input} ${
                touched.email && errors.email ? styles.inputError : ""
              }`}
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
              className={`${styles.input} ${
                touched.password && errors.password
                  ? styles.inputError
                  : ""
              }`}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !dirty || !isValid}
            className={styles.submitButton}
          >
            {loading ? "Please wait..." : "Sign in"}
          </button>

          <button type="button" className={styles.linkA}>
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