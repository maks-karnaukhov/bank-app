import { Formik, Field, Form } from "formik";
import clsx from "clsx";
import styles from "./ForgotPasswordModal.module.css";
import InfoTooltip from "../InfoTooltip/InfoTooltip";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { forgotPasswordThunk } from "@/features/auth/authSlice";
import { resetSchema } from "@/validation/ResetSchema";

interface IProps {
    onCloseModal: () => void;
    onOpenOTP: () => void;
    onSaveEmail: (value: string) => void;
    onError: (message: string) => void;
    onTitle: (value: string) => void;
    onRetryAt: (value: string) => void;
}

export default function ForgotPasswordModal({onCloseModal, onOpenOTP, onSaveEmail, onError, onTitle, onRetryAt}: IProps) {
    const dispatch = useDispatch<AppDispatch>();

    return (
        <Formik
            initialValues={{email: ""}}
            validationSchema={resetSchema}
            onSubmit={async (values) => {
                const result = await dispatch(
                    forgotPasswordThunk(values.email)
                );

                if (forgotPasswordThunk.fulfilled.match(result)) {
                    onSaveEmail(values.email);
                    onCloseModal();
                    onOpenOTP();
                    return;
                }

                if (result.payload?.code === "USER_NOT_FOUND") {
                    onTitle("User not found");
                    onError(
                        "User with this email was not found."
                    );
                    return;
                }

                if (result.payload?.code === "EMAIL_NOT_VERIFIED") {
                    onTitle("Email not verified");
                    onError(
                        "Please verify your email before resetting your password."
                    );
                    return;
                }

                if (result.payload?.code === "PASSWORD_RESET_BLOCKED") {
                    onTitle("Password reset has been temporarily blocked");
                    onRetryAt(result.payload.retryAt!);
                    onError("Please try again later.");
                    return;
                }
            }}
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
                                    setFieldValue("email", e.target.value);
                                }}
                                placeholder="Email"
                                className={clsx(
                                    styles.input,
                                    touched.email && errors.email && styles.inputError,
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
                                isError={Boolean(touched.email && errors.email)}
                            />
                        </div>
                        <button className={styles.submitButton} type="submit">
                            Send verification code
                        </button>
                    </Form>
                </div>
            </div>
            )}
        </Formik>
    )
}