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
}

export default function ForgotPasswordModal({onCloseModal, onOpenOTP, onSaveEmail}: IProps) {
    const dispatch = useDispatch<AppDispatch>();

    return (
        <Formik
            initialValues={{email: ""}}
            validationSchema={resetSchema}
            onSubmit={async (values) => {
                const result = await dispatch(forgotPasswordThunk(values.email));

                if (forgotPasswordThunk.fulfilled.match(result)) {
                    onCloseModal();
                    onOpenOTP();
                    onSaveEmail(values.email);
                }
                // Если пользователь не найден - модалка
                // Если пользователь не подтвердил емаил - модалка
                // Если пользователь израсходовал все попытки ввода кода при сбросе пароля - модалка
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