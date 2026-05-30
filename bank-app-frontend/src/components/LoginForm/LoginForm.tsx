"use client";

import styles from "./LoginForm.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";

import { loginUserThunk } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { loginSchema } from "@/validation/LoginSchema";

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
          <div>
            <Field
              name="email"
              type="email"
              placeholder="Email"
              className={`${styles.input} ${
                touched.email && errors.email ? styles.inputError : ""
              }`}
            />
            <ErrorMessage
              name="email"
              component="div"
              className={styles.error}
            />
          </div>

          <div>
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
            <ErrorMessage
              name="password"
              component="div"
              className={styles.error}
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