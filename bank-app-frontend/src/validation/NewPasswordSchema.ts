import * as Yup from "yup";

export const newPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, "Minimum 8 characters")
    .matches(/[A-Z]/, "At least 1 uppercase letter")
    .matches(/[a-z]/, "At least 1 lowercase letter")
    .matches(/[^A-Za-z0-9]/, "At least 1 special character")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});