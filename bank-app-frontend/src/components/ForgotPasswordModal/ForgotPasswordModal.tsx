import { Formik, Field, Form } from "formik";
import clsx from "clsx";
import styles from "./ForgotPasswordModal.module.css";
import InfoTooltip from "../InfoTooltip/InfoTooltip";
import { useState } from "react";

export default function ForgotPasswordModal() {
    const [authError, setAuthError] = useState<string | null>(null);

    const hasAuthError = !!authError;

    return (
        <Formik
            initialValues={{email: ""}}
            onSubmit={() => console.log()}
        >
            {({
                touched,
                errors,
                setFieldValue,
                setFieldTouched,
            }) => (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <h2 className={styles.title}>Enter your email</h2>
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
                    </Form>
                    {authError && (
                        <p className={styles.error}>
                            {authError}
                        </p>
                    )}
                    <button className={styles.submitButton}>
                        Send verification code
                    </button>
                </div>
            </div>
            )}
        </Formik>
    )
}