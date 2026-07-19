"use client";

import { Formik, Form, Field } from "formik";
import clsx from "clsx";

import styles from "./ResetPasswordModal.module.css";
import { newPasswordSchema } from "@/validation/NewPasswordSchema";
import InfoTooltip from "../InfoTooltip/InfoTooltip";
import { authApi } from "@/services/auth/authApi";

interface IProps {
    email: string;
    onSuccess: () => void;
    onClose: () => void;
}

export default function ResetPasswordModal({
    email,
    onSuccess,
    onClose,
}: IProps) {

    return (
        <Formik
            initialValues={{
                password: "",
                confirmPassword: "",
            }}
            validationSchema={newPasswordSchema}
            onSubmit={async (values) => {
                try {
                    await authApi.resetPassword(
                        email,
                        values.password
                    );

                    onSuccess();

                } catch (error) {
                    console.error(error);
                }
            }}
        >
            {({
                touched,
                errors,
                setFieldTouched,
                setFieldValue,
            }) => (
                <div className={styles.overlay}>
                    <div className={styles.modal}>

                        <h2 className={styles.title}>
                            Create a new password
                        </h2>

                        <Form className={styles.form}>

                            <div className={styles.field}>
                                <Field
                                    name="password"
                                    type="password"
                                    placeholder="New password"
                                    className={clsx(
                                        styles.input,
                                        touched.password &&
                                        errors.password &&
                                        styles.inputError
                                    )}
                                    onBlur={() =>
                                        setFieldTouched("password", true)
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFieldValue(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                />

                                <InfoTooltip
                                    title="Password requirements"
                                    content={
                                        <>
                                            • At least 8 characters
                                            <br />
                                            • 1 uppercase letter
                                            <br />
                                            • 1 lowercase letter
                                            <br />
                                            • 1 special character
                                        </>
                                    }
                                    isError={
                                        Boolean(
                                            touched.password &&
                                            errors.password
                                        )
                                    }
                                />
                            </div>

                            <div className={styles.field}>
                                <Field
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm password"
                                    className={clsx(
                                        styles.input,
                                        touched.confirmPassword &&
                                        errors.confirmPassword &&
                                        styles.inputError
                                    )}
                                    onBlur={() =>
                                        setFieldTouched(
                                            "confirmPassword",
                                            true
                                        )
                                    }
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFieldValue(
                                            "confirmPassword",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <button
                                className={styles.submitButton}
                                type="submit"
                            >
                                Change password
                            </button>

                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                        </Form>

                    </div>
                </div>
            )}
        </Formik>
    );
}